package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import com.simon.armas_springboot_api.dto.MasterTransactionDTO;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.models.Notification;
import com.simon.armas_springboot_api.models.BudgetYear;
import com.simon.armas_springboot_api.repositories.BudgetYearRepository;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.MasterTransactionRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.repositories.NotificationRepository;
import com.simon.armas_springboot_api.dto.UserDTO;
import java.util.Set;
import com.simon.armas_springboot_api.security.models.Role;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Collections;
import java.util.HashSet;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.simon.armas_springboot_api.services.FileStorageService;
import org.springframework.dao.DataIntegrityViolationException;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.Optional;
import java.util.Date;
import java.util.Collections;
import java.util.Objects;

import com.simon.armas_springboot_api.models.Organization;

@Service
public class MasterTransactionService {
    @Autowired
    private MasterTransactionRepository masterTransactionRepository;
     
    @Autowired
    private BudgetYearRepository budgetYearRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private OrganizationRepository organizationRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    
    private void createNotification(User user, String title, String message, String entityType, Long entityId, String context) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setContext(context);
        notificationRepository.save(notification);
    }

    // Upload file by Uploader
@Transactional
public MasterTransaction uploadFile(MultipartFile file, Long budgetYearId, String reportcategory,
        String transactionDocumentId, Principal principal) throws IOException {
    User user = userRepository.findByUsername(principal.getName());
    if (user == null) {
        throw new IllegalArgumentException("User not found: " + principal.getName());
    }
    if (user.getOrganization() == null) {
        throw new IllegalArgumentException("User has no associated organization");
    }

    String docname = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file");
    if (masterTransactionRepository.existsByDocnameAndUserAndBudgetYearIdAndTransactiondocumentId(
            docname, user, budgetYearId, transactionDocumentId)) {
        throw new IllegalArgumentException("Document already exists for this user, budget year, and report type");
    }

    Document document = documentRepository.findById(transactionDocumentId)
            .orElseThrow(() -> new IllegalArgumentException("Document not found: " + transactionDocumentId));
    BudgetYear budgetYear = budgetYearRepository.findById(budgetYearId)
            .orElseThrow(() -> new IllegalArgumentException("Budget Year not found: " + budgetYearId));

    if ("Feedback".equalsIgnoreCase(reportcategory.trim())) {
        System.out.println("Checking Feedback: docid=" + transactionDocumentId +
                ", orgId=" + user.getOrganization().getId() + ", fiscalYear=" + budgetYear.getFiscalYear());
        List<MasterTransaction> existingReports = masterTransactionRepository.findTransactionByDocumentId(
                "Report", transactionDocumentId, user.getOrganization().getId(), budgetYear.getFiscalYear());
        System.out.println("Found " + existingReports.size() + " existing reports");
        if (existingReports.isEmpty()) {
            throw new IllegalArgumentException("Report for this feedback was not uploaded. Upload the report first!");
        }
        boolean hasResponseNeededYes = existingReports.stream()
                .anyMatch(report -> "Yes".equalsIgnoreCase(report.getResponse_needed()));
        System.out.println("Has response_needed='Yes': " + hasResponseNeededYes);
        if (!hasResponseNeededYes) {
            throw new IllegalArgumentException(
                    "The uploaded report's response_needed is not set to 'Yes'. Wait until the experts respond to your report.");
        }
    }

    MasterTransaction transaction = new MasterTransaction();
    transaction.setUser(user);
    transaction.setOrganization(user.getOrganization());
    transaction.setDocname(docname);
    transaction.setReportstatus("Submitted");
    transaction.setReportcategory(reportcategory);
    transaction.setBudgetYear(budgetYear);
    transaction.setTransactiondocument(document);
    transaction.setFilepath(fileStorageService.storeFile(file, transaction, principal, false));
    transaction.setCreatedDate(new Date());
    transaction.setCreatedBy(principal.getName());

    // Assign to APPROVER for "Others", else assign to SENIOR_AUDITOR
    if ("Others".equalsIgnoreCase(reportcategory.trim())) {
        List<User> approvers = userRepository.findByRoleName("APPROVER");
        User defaultApprover = approvers.stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No APPROVER available to assign"));
        transaction.setUser2(defaultApprover);
        transaction.setReportstatus("Under Review"); // Set to Under Review for APPROVER
    } else {
        List<User> experts = userRepository.findByRoleName("SENIOR_AUDITOR");
        User defaultExpert = experts.stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("No SENIOR_AUDITOR available to assign"));
        transaction.setUser2(defaultExpert);
    }

    if ("Report".equalsIgnoreCase(reportcategory.trim())) {
        transaction.setResponse_needed("Pending");
    }

    try {
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);
        System.out.println("Transaction saved: ID=" + savedTransaction.getId());

        List<User> archivers = userRepository.findByRoleName("ARCHIVER");
        for (User archiver : archivers) {
            createNotification(
                    archiver,
                    "New Report Uploaded",
                    "A new report '" + savedTransaction.getDocname() + "' has been uploaded by " + principal.getName(),
                    "MasterTransaction",
                    savedTransaction.getId().longValue(),
                    "report_uploaded"
            );
        }
        return savedTransaction;
    } catch (DataIntegrityViolationException e) {
        throw new IllegalArgumentException("Database error: Possible duplicate entry or invalid data: " + e.getMessage(), e);
    }
}
@Transactional
    public MasterTransaction uploadLetter(Integer transactionId, MultipartFile letter, String currentUsername) throws IOException {
        User archiver = userRepository.findByUsername(currentUsername);
        if (archiver == null || !archiver.getRoles().stream().anyMatch(r -> "ARCHIVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Unauthorized: Must be an ARCHIVER");
        }

        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        if (letter == null || letter.isEmpty()) {
            throw new IllegalArgumentException("Letter file is required");
        }

        String letterPath = fileStorageService.storeFile(letter, transaction, new Principal() {
            @Override
            public String getName() {
                return currentUsername;
            }
        }, true);
        transaction.setLetterPath(letterPath);
        transaction.setLetterDocname(letter.getOriginalFilename());
        transaction.setLastModifiedBy(currentUsername);

        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        fileStorageService.validateAndCopyMigratedFiles(savedTransaction);

        User uploader = transaction.getUser();
        if (uploader != null) {
            createNotification(
                    uploader,
                    "Letter Uploaded",
                    "A letter '" + savedTransaction.getLetterDocname() + "' has been uploaded for your report '" + savedTransaction.getDocname() + "' by " + currentUsername,
                    "MasterTransaction",
                    savedTransaction.getId().longValue(),
                    "letter_uploaded"
            );
        } else {
            System.err.println("No uploader found for transaction ID: " + transactionId);
        }

        if (transaction.getOrganization() != null && transaction.getOrganization().getId() != null) {
            List<User> managers = userRepository.findByRoleNameAndOrganizationId("MANAGER", transaction.getOrganization().getId());
            for (User manager : managers) {
                createNotification(
                        manager,
                        "Letter Uploaded",
                        "A letter '" + savedTransaction.getLetterDocname() + "' has been uploaded for report '" + savedTransaction.getDocname() + "' by " + currentUsername,
                        "MasterTransaction",
                        savedTransaction.getId().longValue(),
                        "letter_uploaded"
                );
            }
        }

        return savedTransaction;
    }


      public Map<String, Path> getFilePaths(Integer id) {
        MasterTransaction transaction = masterTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        Map<String, Path> paths = new HashMap<>();
        paths.put("original", Paths.get(transaction.getFilepath()));
        if (transaction.getSupportingDocumentPath() != null) {
            paths.put("supporting", Paths.get(transaction.getSupportingDocumentPath()));
        }
        return paths;
    }

    public List<SentReportResponseDTO> getSentReportData(String role) {
        List<String> statuses;
        if ("ARCHIVER".equals(role)) {
            statuses = Arrays.asList("Submitted", "Approved");
        } else if ("SENIOR_AUDITOR".equals(role)) {
            statuses = Arrays.asList("Assigned", "Rejected");
        } else if ("APPROVER".equals(role)) {
            statuses = Arrays.asList("Under Review");
        } else {
            statuses = Arrays.asList("Submitted", "Assigned", "Under Review", "Rejected", "Approved");
        }
        System.out.println("Fetching reports for role: " + role + ", statuses: " + statuses);
        List<SentReportResponseDTO> reports = masterTransactionRepository.fetchDataByStatuses(statuses);
        System.out.println("Fetched reports: " + reports);
        return reports;
    }

    public List<UserDTO> getUsersByRole(String roleName) {
        System.out.println("Fetching users for role: " + roleName);
        List<User> users = userRepository.findByRoleName(roleName);
        List<UserDTO> userDTOs = users.stream()
                .map(user -> new UserDTO(user.getId(), user.getUsername(), user.getFirstName(), user.getLastName()))
                .collect(Collectors.toList());
        System.out.println("Fetched users for role " + roleName + ": " + userDTOs);
        return userDTOs;
    }

    @Transactional
    public MasterTransaction assignAuditor(Integer transactionId, String auditorUsername, String currentUsername) {
        User archiver = userRepository.findByUsername(currentUsername);
        if (archiver == null || !archiver.getRoles().stream().anyMatch(r -> "ARCHIVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Unauthorized: Must be an Archiver");
        }

        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        if (!"Submitted".equals(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only assign Submitted tasks");
        }

        User auditor = userRepository.findByUsername(auditorUsername);
        if (auditor == null
                || !auditor.getRoles().stream().anyMatch(r -> "SENIOR_AUDITOR".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Invalid Senior Auditor: " + auditorUsername);
        }

        transaction.setUser2(auditor);
        transaction.setAssignedBy(archiver);
        transaction.setReportstatus("Assigned");
        transaction.setLastModifiedBy(currentUsername);
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        createNotification(
                auditor,
                "Task Assigned",
                "You have been assigned to evaluate report '" + savedTransaction.getDocname() + "'",
                "MasterTransaction",
                savedTransaction.getId().longValue(),
                "task_assigned"
            );

        System.out.println("Assigned task: ID=" + savedTransaction.getId() + ", user2=" + auditor.getUsername());
        return savedTransaction;
    }
@Transactional
    public MasterTransaction submitFindings(Integer transactionId, String findings, String approverUsername,
            String responseNeeded, String currentUsername, MultipartFile supportingDocument) throws IOException {
        System.out.println("Starting submitFindings: transactionId=" + transactionId + ", currentUsername=" + currentUsername);
        
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        System.out.println("Transaction found: status=" + transaction.getReportstatus());

        if (!Arrays.asList("Assigned", "Rejected").contains(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only submit findings for Assigned or Rejected reports");
        }

        User approver = userRepository.findByUsername(approverUsername);
        if (approver == null || !approver.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Invalid Approver: " + approverUsername);
        }

        if (!Arrays.asList("Pending", "Yes", "No").contains(responseNeeded)) {
            throw new IllegalArgumentException("Invalid response_needed value: " + responseNeeded);
        }

        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null) {
            throw new IllegalArgumentException("Current user not found: " + currentUsername);
        }

        transaction.setRemarks(findings);
        transaction.setUser2(approver);
        transaction.setReportstatus(transaction.getReportstatus().equals("Rejected") ? "Corrected" : "Under Review");
        transaction.setSubmittedByAuditor(currentUser);
        transaction.setResponse_needed(responseNeeded);

        if (supportingDocument != null && !supportingDocument.isEmpty()) {
            String supportingPath = fileStorageService.storeFile(supportingDocument, transaction, new Principal() {
                @Override
                public String getName() {
                    return currentUsername;
                }
            }, true);
            System.out.println("Supporting document stored: " + supportingPath);
        }

        transaction.setLastModifiedBy(currentUsername);
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        createNotification(
                approver,
                "New Task for Review",
                "A task '" + savedTransaction.getDocname() + "' has been submitted for your review by " + currentUsername,
                "MasterTransaction",
                savedTransaction.getId().longValue(),
                "task_evaluated"
        );

        fileStorageService.validateAndCopyMigratedFiles(savedTransaction);

        return savedTransaction;
    }

   @Transactional
    public MasterTransaction approveReport(Integer transactionId, String currentUsername,
            MultipartFile approvalDocument) throws IOException {
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        transaction.setReportstatus("Approved");
        transaction.setLastModifiedBy(currentUsername);

        if (approvalDocument != null && !approvalDocument.isEmpty()) {
            String approvalPath = fileStorageService.storeFile(approvalDocument, transaction, new Principal() {
                @Override
                public String getName() {
                    return currentUsername;
                }
            }, true);
            transaction.setSupportingDocumentPath(approvalPath);
            transaction.setSupportingDocname(approvalDocument.getOriginalFilename());
            System.out.println("Approval document stored: " + approvalPath);
        }

        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        fileStorageService.validateAndCopyMigratedFiles(savedTransaction);

        if (savedTransaction.getAssignedBy() != null) {
            createNotification(
                    savedTransaction.getAssignedBy(),
                    "Task Approved",
                    "The task '" + savedTransaction.getDocname() + "' you assigned has been approved",
                    "MasterTransaction",
                    savedTransaction.getId().longValue(),
                    "task_approved"
            );
        }

        return savedTransaction;
    }

    @Transactional
    public MasterTransaction rejectReport(Integer transactionId, String rejectionReason, String currentUsername,
            MultipartFile rejectionDocument) throws IOException {
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null
                || !currentUser.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Unauthorized: Must have APPROVER role");
        }
        if (!Arrays.asList("Under Review", "Corrected").contains(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only reject reports in Under Review or Corrected status");
        }
        if (transaction.getUser2() == null || !transaction.getUser2().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Unauthorized: Must be the assigned Approver");
        }
        transaction.setReportstatus("Rejected");
        transaction.setReason_of_rejection(rejectionReason);
        if (rejectionDocument != null && !rejectionDocument.isEmpty()) {
            String rejectionPath = fileStorageService.storeFile(rejectionDocument, transaction, new Principal() {
                @Override
                public String getName() {
                    return currentUsername;
                }
            }, true);
            transaction.setSupportingDocumentPath(rejectionPath);
            transaction.setSupportingDocname(rejectionDocument.getOriginalFilename());
        }
        transaction.setUser2(transaction.getSubmittedByAuditor());
        transaction.setLastModifiedBy(currentUsername);
        return masterTransactionRepository.save(transaction);
    }

    public List<MasterTransaction> getTasks(Long userId, String role) {
        List<MasterTransaction> tasks = new ArrayList<>();
        System.out.println("Fetching tasks for userId=" + userId + ", role=" + role);
        switch (role) {
            case "ARCHIVER":
                tasks = masterTransactionRepository.findTasksAssignedByArchiver(userId);
                System.out.println("ARCHIVER tasks fetched: " + tasks.size());
                break;
            case "SENIOR_AUDITOR":
                List<MasterTransaction> activeTasks = masterTransactionRepository.findActiveSeniorAuditorTasks(userId);
                List<MasterTransaction> approvedTasks = masterTransactionRepository.findApprovedSeniorAuditorTasks(userId);
                System.out.println("SENIOR_AUDITOR active tasks: " + activeTasks.size());
                activeTasks.forEach(task -> System.out.println("Active task: ID=" + task.getId() +
                        ", Status=" + task.getReportstatus() +
                        ", User2=" + (task.getUser2() != null ? task.getUser2().getId() : "null") +
                        ", Docname=" + task.getDocname()));
                System.out.println("SENIOR_AUDITOR approved tasks: " + approvedTasks.size());
                approvedTasks.forEach(task -> System.out.println("Approved task: ID=" + task.getId() +
                        ", Status=" + task.getReportstatus() +
                        ", User2=" + (task.getUser2() != null ? task.getUser2().getId() : "null") +
                        ", Docname=" + task.getDocname()));
                tasks.addAll(activeTasks);
                tasks.addAll(approvedTasks);
                break;
            case "APPROVER":
                    List<String> activeStatuses = Arrays.asList("Under Review", "Corrected");
                    List<String> completedStatuses = Arrays.asList("Approved", "Rejected");
                    tasks.addAll(masterTransactionRepository.findApproverTasks(userId, activeStatuses));
                    tasks.addAll(masterTransactionRepository.findCompletedApproverTasks(userId, completedStatuses));
                    break;
            default:
                throw new IllegalArgumentException("Invalid role: " + role);
        }
        System.out.println("Total tasks returned: " + tasks.size());
        tasks.forEach(task -> System.out.println("Task: ID=" + task.getId() +
                ", Status=" + task.getReportstatus() +
                ", User2=" + (task.getUser2() != null ? task.getUser2().getId() : "null") +
                ", Docname=" + task.getDocname()));
        return tasks;
    }

public List<MasterTransactionDTO> getApprovedReports(String username, String role) {
    List<MasterTransaction> reports;
    if ("ARCHIVER".equals(role) || "APPROVER".equals(role)) {
        reports = masterTransactionRepository.findByReportstatus("Approved");
    } else if ("SENIOR_AUDITOR".equals(role)) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found: " + username);
        }
        reports = masterTransactionRepository.findByReportstatusAndSubmittedByAuditor("Approved", user);
    } else {
        throw new IllegalArgumentException("Invalid role for approved reports: " + role);
    }
    System.out.println("Fetched " + reports.size() + " approved reports for " + username + " (" + role + ")");
    reports.forEach(report -> {
        System.out.println("Report: ID=" + report.getId() +
                ", FiscalYear=" + (report.getBudgetYear() != null ? report.getBudgetYear().getFiscalYear() : "null") +
                ", SupportingDocname=" + report.getSupportingDocname());
    });
    return reports.stream().map(MasterTransactionDTO::new).collect(Collectors.toList());
}

public List<MasterTransactionDTO> getRejectedReports() {
    List<MasterTransaction> reports = masterTransactionRepository.findRejectedReports();
    System.out.println("Fetched " + reports.size() + " rejected reports");
    reports.forEach(report -> {
        System.out.println("Report: ID=" + report.getId() +
                ", FiscalYear=" + (report.getBudgetYear() != null ? report.getBudgetYear().getFiscalYear() : "null"));
    });
    return reports.stream().map(MasterTransactionDTO::new).collect(Collectors.toList());
}

    public List<MasterTransaction> getUnderReviewReports() {
        return masterTransactionRepository.findUnderReviewReports();
    }

    public List<MasterTransaction> getCorrectedReports() {
        return masterTransactionRepository.findCorrectedReports();
    }

    public List<Organization> getReportNonSenders(String reportype, String fiscalYear) {
    System.out.println("Fetching report non-senders: reportype=" + reportype + ", fiscalYear=" + fiscalYear);
    try {
        if (reportype == null || reportype.trim().isEmpty()) {
            throw new IllegalArgumentException("Report type is required");
        }
        if (fiscalYear == null || fiscalYear.trim().isEmpty()) {
            throw new IllegalArgumentException("Fiscal year is required");
        }
        boolean budgetYearExists = budgetYearRepository.existsByFiscalYear(fiscalYear);
        if (!budgetYearExists) {
            System.out.println("No BudgetYear found for fiscalYear: " + fiscalYear);
            return new ArrayList<>();
        }
        boolean documentExists = documentRepository.existsByReportype(reportype);
        if (!documentExists) {
            System.out.println("No Document found for reportype: " + reportype);
            return new ArrayList<>();
        }
        List<Organization> nonSenders = masterTransactionRepository.findReportNonSendersByReportTypeAndBudgetYear(reportype, fiscalYear);
        System.out.println("Found " + nonSenders.size() + " non-senders");
        return nonSenders;
    } catch (Exception e) {
        System.err.println("Error fetching report non-senders: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to fetch report non-senders: " + e.getMessage(), e);
    }
}

    public List<MasterTransactionDTO> getReportsByOrgAndFilters(String reportype, String fiscalYear, String orgId) {
        List<MasterTransaction> transactions = masterTransactionRepository
                .findReportsByOrgAndReportTypeAndBudgetYear(reportype, fiscalYear, orgId);
        return transactions.stream().map(MasterTransactionDTO::new).collect(Collectors.toList());
    }

    public List<Organization> getAllOrganizationsWithReports() {
        return masterTransactionRepository.findAllOrganizationsWithReports();
    }

    public List<Organization> getFeedbackNonSenders(String reportype, String fiscalYear) {
    System.out.println("Fetching feedback non-senders: reportype=" + reportype + ", fiscalYear=" + fiscalYear);
    try {
        if (reportype == null || reportype.trim().isEmpty()) {
            throw new IllegalArgumentException("Report type is required");
        }
        if (fiscalYear == null || fiscalYear.trim().isEmpty()) {
            throw new IllegalArgumentException("Fiscal year is required");
        }
        boolean budgetYearExists = budgetYearRepository.existsByFiscalYear(fiscalYear);
        if (!budgetYearExists) {
            System.out.println("No BudgetYear found for fiscalYear: " + fiscalYear);
            return new ArrayList<>();
        }
        boolean documentExists = documentRepository.existsByReportype(reportype);
        if (!documentExists) {
            System.out.println("No Document found for reportype: " + reportype);
            return new ArrayList<>();
        }
        List<Organization> nonSenders = masterTransactionRepository.findFeedbackNonSendersByReportTypeAndBudgetYear(reportype, fiscalYear);
        System.out.println("Found " + nonSenders.size() + " feedback non-senders");
        return nonSenders;
    } catch (Exception e) {
        System.err.println("Error fetching feedback non-senders: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to fetch feedback non-senders: " + e.getMessage(), e);
    }
}

    public List<MasterTransactionDTO> getFeedbackSenders(String reportype, String fiscalYear) {
        List<MasterTransaction> transactions = masterTransactionRepository
                .findFeedbackSendersByReportTypeAndBudgetYear(reportype, fiscalYear);
        return transactions.stream().map(MasterTransactionDTO::new).collect(Collectors.toList());
    }

    public long getTotalOrganizations() {
    return organizationRepository.count();
}

public long getTotalReportTypes() {
    return documentRepository.count();
}

public long getSendersCount(String fiscalYear) {
    return masterTransactionRepository.countSendersByFiscalYear(fiscalYear);
}

public long getNonSendersCount(String fiscalYear) {
    return getTotalOrganizations() - getSendersCount(fiscalYear);
}

public long getSendersCountForReportType(String reportype, String fiscalYear) {
    return masterTransactionRepository.countSendersByReportTypeAndFiscalYear(reportype, fiscalYear);
}

public long getNonSendersCountForReportType(String reportype, String fiscalYear) {
    return getTotalOrganizations() - getSendersCountForReportType(reportype, fiscalYear);
}

public List<MasterTransactionDTO> getTransactionHistory(Long userId) {
    List<MasterTransaction> transactions = masterTransactionRepository.findTransactionHistoryByUserId(userId);
    return transactions.stream()
            .map(MasterTransactionDTO::new)
            .collect(Collectors.toList());
}

public List<MasterTransaction> getLettersForOrganization(String orgId) {
        return masterTransactionRepository.findTransactionsWithLettersByOrganization(orgId);
    }

    public List<String> getAllReportTypes() {
        try {
            List<String> reportTypes = documentRepository.findAll().stream()
                    .map(Document::getReportype)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());
            return reportTypes;
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public Map<String, Map<String, Long>> getAllReportTypeStats(String fiscalYear) {
        if (!budgetYearRepository.existsByFiscalYear(fiscalYear)) {
            return new HashMap<>();
        }
        List<String> reportTypes = getAllReportTypes();
        Map<String, Map<String, Long>> stats = new HashMap<>();
        for (String reportType : reportTypes) {
            try {
                Map<String, Long> counts = new HashMap<>();
                counts.put("senders", getSendersCountForReportType(reportType, fiscalYear));
                counts.put("nonSenders", getNonSendersCountForReportType(reportType, fiscalYear));
                stats.put(reportType, counts);
            } catch (Exception e) {
            }
        }
        return stats;
    }

@Transactional
public MasterTransaction reassignTask(Integer transactionId, String auditorUsername, String currentUsername) {
    User archiver = userRepository.findByUsername(currentUsername);
    if (archiver == null) {
        throw new IllegalArgumentException("User not found: " + currentUsername);
    }
    if (!archiver.getRoles().stream().anyMatch(r -> "ARCHIVER".equals(r.getDescription()))) {
        throw new IllegalArgumentException("Unauthorized: Must be an ARCHIVER");
    }

    MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

    if (!Arrays.asList("Assigned", "Rejected").contains(transaction.getReportstatus())) {
        throw new IllegalStateException("Can only reassign tasks with status 'Assigned' or 'Rejected'");
    }

    User newAuditor = userRepository.findByUsername(auditorUsername);
    if (newAuditor == null) {
        throw new IllegalArgumentException("Senior Auditor not found: " + auditorUsername);
    }
    if (!newAuditor.getRoles().stream().anyMatch(r -> "SENIOR_AUDITOR".equals(r.getDescription()))) {
        throw new IllegalArgumentException("Invalid Senior Auditor: " + auditorUsername);
    }

    User previousAuditor = transaction.getUser2();

    transaction.setUser2(newAuditor);
    transaction.setLastModifiedBy(currentUsername);
    transaction.setReportstatus("Assigned");
    try {
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        createNotification(
                newAuditor,
                "Task Reassigned",
                "Task '" + savedTransaction.getDocname() + "' has been reassigned to you by " + currentUsername,
                "MasterTransaction",
                savedTransaction.getId().longValue(),
                "task_reassigned"
        );

        if (previousAuditor != null && !previousAuditor.getUsername().equals(auditorUsername)) {
            createNotification(
                    previousAuditor,
                    "Task Reassignment",
                    "Task '" + savedTransaction.getDocname() + "' has been reassigned from you to another auditor by " + currentUsername,
                    "MasterTransaction",
                    savedTransaction.getId().longValue(),
                    "task_reassigned"
            );
        }

        return savedTransaction;
    } catch (DataIntegrityViolationException e) {
        throw new IllegalStateException("Database error during reassignment: " + e.getMessage(), e);
    } catch (Exception e) {
        throw new RuntimeException("Unexpected error during reassignment: " + e.getMessage(), e);
    }
}
@Transactional
public MasterTransaction assignApprover(Integer transactionId, String approverUsername, String currentUsername) {
    User archiver = userRepository.findByUsername(currentUsername);
    if (archiver == null || !archiver.getRoles().stream().anyMatch(r -> "ARCHIVER".equals(r.getDescription()))) {
        throw new IllegalArgumentException("Unauthorized: Must be an Archiver");
    }

    MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
    if (!"Submitted".equals(transaction.getReportstatus())) {
        throw new IllegalStateException("Can only assign Submitted tasks");
    }

    User approver = userRepository.findByUsername(approverUsername);
    if (approver == null || !approver.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
        throw new IllegalArgumentException("Invalid Approver: " + approverUsername);
    }

    transaction.setUser2(approver);
    transaction.setAssignedBy(archiver);
    transaction.setReportstatus("Under Review"); // Directly set to Under Review for APPROVER
    transaction.setLastModifiedBy(currentUsername);
    MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

    createNotification(
            approver,
            "Task Assigned",
            "You have been assigned to review report '" + savedTransaction.getDocname() + "'",
            "MasterTransaction",
            savedTransaction.getId().longValue(),
            "task_assigned"
    );

    System.out.println("Assigned task to Approver: ID=" + savedTransaction.getId() + ", user2=" + approver.getUsername());
    return savedTransaction;
}
@Transactional
    public MasterTransaction dispatchDocumentToOrganizations(MultipartFile letter, List<String> organizationIds, String currentUsername) throws IOException {
        // Validate the user is an APPROVER
        User approver = userRepository.findByUsername(currentUsername);
        if (approver == null || !approver.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Unauthorized: Must be an APPROVER");
        }

        // Validate file
        if (letter == null || letter.isEmpty()) {
            throw new IllegalArgumentException("Letter file is required");
        }

        // Validate organization IDs
        if (organizationIds == null || organizationIds.isEmpty()) {
            throw new IllegalArgumentException("At least one organization must be selected");
        }

        // Create a new MasterTransaction
        MasterTransaction transaction = new MasterTransaction();
        transaction.setDocname(StringUtils.cleanPath(letter.getOriginalFilename()));
        transaction.setReportstatus("Dispatched");
        transaction.setReportcategory("Letter");
        transaction.setCreatedBy(currentUsername);
        transaction.setCreatedDate(new Date());
        transaction.setLastModifiedBy(currentUsername);

        // Store the file
        String letterPath = fileStorageService.storeFile(letter, transaction, new Principal() {
            @Override
            public String getName() {
                return currentUsername;
            }
        }, true);
        transaction.setLetterPath(letterPath);
        transaction.setLetterDocname(letter.getOriginalFilename());

        // Fetch and set dispatched organizations
        Set<Organization> organizations = new HashSet<>();
        List<String> invalidIds = new ArrayList<>();
        for (String id : organizationIds) {
            Optional<Organization> org = organizationRepository.findById(id);
            if (org.isPresent()) {
                organizations.add(org.get());
            } else {
                invalidIds.add(id);
            }
        }
        if (!invalidIds.isEmpty()) {
            throw new IllegalArgumentException("The following organization IDs are invalid: " + invalidIds);
        }
        transaction.setDispatchedOrganizations(organizations);

        // Save the transaction
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        // Notify USERS and MANAGERS in the selected organizations
        for (Organization org : organizations) {
            List<User> usersAndManagers = userRepository.findByOrganizationId(org.getId()).stream()
                .filter(user -> user.getRoles().stream().anyMatch(r -> "USER".equals(r.getDescription()) || "MANAGER".equals(r.getDescription())))
                .collect(Collectors.toList());

            for (User user : usersAndManagers) {
                createNotification(
                    user,
                    "New Letter Dispatched",
                    "A new letter '" + savedTransaction.getLetterDocname() + "' has been dispatched to your organization by " + currentUsername,
                    "MasterTransaction",
                    savedTransaction.getId().longValue(),
                    "letter_dispatched"
                );
            }
        }

        fileStorageService.validateAndCopyMigratedFiles(savedTransaction);
        return savedTransaction;
    }

    public List<MasterTransaction> getDispatchedLettersForOrganization(String orgId) {
        return masterTransactionRepository.findDispatchedLettersByOrganization(orgId);
    }
}