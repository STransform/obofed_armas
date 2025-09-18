package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.models.BudgetYear;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.repositories.BudgetYearRepository;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.repositories.MasterTransactionRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.services.MasterTransactionService;
import com.simon.armas_springboot_api.dto.UserDTO;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.models.Organization;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.dto.MasterTransactionDTO;
import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import com.simon.armas_springboot_api.models.Notification;
import com.simon.armas_springboot_api.repositories.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.core.Authentication;
import java.security.Principal;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.Collections;
import org.springframework.dao.DataIntegrityViolationException;
import org.apache.commons.lang3.StringUtils; 
import java.nio.file.Path;
@RestController
@RequestMapping("/transactions")
public class MasterTransactionController {
    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private MasterTransactionRepository masterTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MasterTransactionService masterTransactionService;

    @Autowired
    private BudgetYearRepository budgetYearRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/notifications")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.emptyList());
        }
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/notifications/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Principal principal) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification == null || !notification.getUser().getUsername().equals(principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }

@PostMapping("/upload")
@PreAuthorize("hasRole('USER')")
public ResponseEntity<?> uploadFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam("reportcategory") String reportcategory,
        @RequestParam("budgetYearId") Long budgetYearId,
        @RequestParam("transactiondocumentid") String transactionDocumentId,
        Principal principal) {
    try {
        // Check file size (500MB = 500 * 1024 * 1024 bytes)
        long maxFileSize = 500 * 1024 * 1024; // 500MB in bytes
        if (file.getSize() > maxFileSize) {
            return ResponseEntity.badRequest().body(Map.of("error", "Your file exceeds maximum size of 500MB."));
        }

        MasterTransaction transaction = masterTransactionService.uploadFile(
                file, budgetYearId, reportcategory, transactionDocumentId, principal);
        return ResponseEntity.ok(transaction);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (DataIntegrityViolationException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Database error: Possible duplicate entry or invalid data: " + e.getMessage()));
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to store file: " + e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unexpected error: " + e.getMessage()));
    }
}

    @GetMapping("/download/{id}/{type}")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR', 'ARCHIVER', 'USER', 'MANAGER')")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Integer id,
            @PathVariable String type,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        User currentUser = userRepository.findByUsername(principal.getName());
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        if ("letter".equalsIgnoreCase(type)) {
            boolean isArchiver = currentUser.getRoles().stream().anyMatch(r -> "ARCHIVER".equals(r.getDescription()));
            boolean isUploader = transaction.getUser() != null && currentUser.getId().equals(transaction.getUser().getId());
            boolean isManagerInOrg = currentUser.getRoles().stream().anyMatch(r -> "MANAGER".equals(r.getDescription())) &&
                                    currentUser.getOrganization() != null &&
                                    transaction.getOrganization() != null &&
                                    currentUser.getOrganization().getId().equals(transaction.getOrganization().getId());
            boolean isUserInDispatchedOrg = currentUser.getRoles().stream().anyMatch(r -> "USER".equals(r.getDescription())) &&
                                            currentUser.getOrganization() != null &&
                                            transaction.getDispatchedOrganizations().stream()
                                                .anyMatch(org -> org.getId().equals(currentUser.getOrganization().getId()));
            
            if (!isArchiver && !isUploader && !isManagerInOrg && !isUserInDispatchedOrg) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
        }

        String filePath;
        String fileName;
        switch (type.toLowerCase()) {
            case "original":
                filePath = transaction.getFilepath();
                fileName = transaction.getDocname();
                break;
            case "supporting":
                filePath = transaction.getSupportingDocumentPath();
                fileName = transaction.getSupportingDocname();
                break;
            case "letter":
                filePath = transaction.getLetterPath();
                fileName = transaction.getLetterDocname();
                break;
            default:
                return ResponseEntity.badRequest().body(null);
        }

        if (filePath == null || fileName == null) {
            System.err.println("File path or name is null for transaction ID=" + id + ", type=" + type);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            System.err.println("File does not exist at path: " + filePath + " for transaction ID=" + id + ", type=" + type);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            System.err.println("File is not readable: " + filePath + " for transaction ID=" + id + ", type=" + type);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        String contentType = Files.probeContentType(path);
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    @GetMapping("/my-reports")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<MasterTransaction>> getMyReports(Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            throw new IllegalStateException("User not found: " + principal.getName());
        }
        List<MasterTransaction> reports = masterTransactionRepository.findByUserIdWithLetters(user.getId());
        return ResponseEntity.ok(reports);
    }

@PostMapping("/upload-letter/{transactionId}")
@PreAuthorize("hasRole('ARCHIVER')")
public ResponseEntity<?> uploadLetter(
        @PathVariable Integer transactionId,
        @RequestParam("letter") MultipartFile letter,
        Principal principal) {
    try {
        // Check file size (500MB = 500 * 1024 * 1024 bytes)
        long maxFileSize = 500 * 1024 * 1024; // 500MB in bytes
        if (letter.getSize() > maxFileSize) {
            return ResponseEntity.badRequest().body(Map.of("error", "Your file exceeds maximum size of 500MB."));
        }

        MasterTransaction transaction = masterTransactionService.uploadLetter(transactionId, letter, principal.getName());
        return ResponseEntity.ok(transaction);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to store file: " + e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unexpected error: " + e.getMessage()));
    }
}

    @GetMapping("/sent-reports")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR', 'ARCHIVER')")
    public ResponseEntity<List<SentReportResponseDTO>> getSentReports(Principal principal) {
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .filter(auth -> auth.equals("ARCHIVER") || auth.equals("SENIOR_AUDITOR") || auth.equals("APPROVER"))
                .findFirst()
                .orElse("USER");
        return ResponseEntity.ok(masterTransactionService.getSentReportData(role));
    }

    @GetMapping("/listdocuments")
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentRepository.findAll();
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/users-by-role/{roleName}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String roleName) {
        try {
            List<UserDTO> users = masterTransactionService.getUsersByRole(roleName);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch users for role " + roleName + ": " + e.getMessage());
        }
    }

    @PostMapping("/assign/{transactionId}")
    @PreAuthorize("hasRole('ARCHIVER')")
    public ResponseEntity<MasterTransaction> assignAuditor(@PathVariable Integer transactionId,
            @RequestParam String auditorUsername,
            Principal principal) {
        MasterTransaction transaction = masterTransactionService.assignAuditor(transactionId, auditorUsername,
                principal.getName());
        return ResponseEntity.ok(transaction);
    }
@PostMapping("/assign-approver/{transactionId}")
@PreAuthorize("hasRole('ARCHIVER')")
public ResponseEntity<MasterTransaction> assignApprover(@PathVariable Integer transactionId,
        @RequestParam String approverUsername,
        Principal principal) {
    MasterTransaction transaction = masterTransactionService.assignApprover(transactionId, approverUsername,
            principal.getName());
    return ResponseEntity.ok(transaction);
}
    @PostMapping("/submit-findings/{transactionId}")
    @PreAuthorize("hasRole('SENIOR_AUDITOR')")
    public ResponseEntity<?> submitFindings(
            @PathVariable Integer transactionId,
            @RequestParam String remarks,
            @RequestParam String approverUsername,
            @RequestParam String responseNeeded,
            @RequestParam(value = "supportingDocument", required = false) MultipartFile supportingDocument,
            Principal principal) {
        try {
            MasterTransaction transaction = masterTransactionService.submitFindings(transactionId, remarks,
                    approverUsername, responseNeeded, principal.getName(), supportingDocument);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to store file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/approved-reports")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR', 'ARCHIVER')")
    public ResponseEntity<List<MasterTransactionDTO>> getApprovedReports(Principal principal) {
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .filter(auth -> auth.equals("ARCHIVER") || auth.equals("SENIOR_AUDITOR") || auth.equals("APPROVER"))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("User does not have required role"));

        List<MasterTransactionDTO> approvedReports = masterTransactionService.getApprovedReports(principal.getName(),
                role);
        return ResponseEntity.ok(approvedReports);
    }

    @PostMapping("/approve/{transactionId}")
    @PreAuthorize("hasRole('APPROVER')")
    public ResponseEntity<MasterTransaction> approveReport(
            @PathVariable Integer transactionId,
            @RequestParam(value = "approvalDocument", required = false) org.springframework.web.multipart.MultipartFile approvalDocument,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.approveReport(transactionId, principal.getName(), approvalDocument);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/reject/{transactionId}")
    @PreAuthorize("hasRole('APPROVER')")
    public ResponseEntity<MasterTransaction> rejectReport(
            @PathVariable Integer transactionId,
            @RequestParam String rejectionReason,
            @RequestParam(value = "rejectionDocument", required = false) org.springframework.web.multipart.MultipartFile rejectionDocument,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.rejectReport(transactionId, rejectionReason,
                principal.getName(), rejectionDocument);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/rejected-reports")
    @PreAuthorize("hasAnyRole('ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<MasterTransaction>> getRejectedReports() {
        List<MasterTransaction> reports = masterTransactionRepository.findByReportStatus("Rejected");
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/tasks")
    @PreAuthorize("hasAnyRole('ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<MasterTransactionDTO>> getTasks(Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            throw new IllegalStateException("User not found: " + principal.getName());
        }

        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .filter(auth -> Arrays.asList("ARCHIVER", "SENIOR_AUDITOR", "APPROVER").contains(auth))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No valid role found"));

        List<MasterTransaction> tasks = masterTransactionService.getTasks(user.getId(), role);
        List<MasterTransactionDTO> taskDTOs = tasks.stream()
                .map(MasterTransactionDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    @GetMapping("/under-review-reports")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR')")
    public ResponseEntity<List<MasterTransaction>> getUnderReviewReports() {
        List<MasterTransaction> reports = masterTransactionService.getUnderReviewReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/corrected-reports")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR')")
    public ResponseEntity<List<MasterTransaction>> getCorrectedReports() {
        List<MasterTransaction> reports = masterTransactionService.getCorrectedReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/budget-years")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SENIOR_AUDITOR', 'APPROVER', 'ARCHIVER','MANAGER')")
    public ResponseEntity<List<BudgetYear>> getBudgetYears() {
        List<BudgetYear> budgetYears = budgetYearRepository.findAll();
        return ResponseEntity.ok(budgetYears);
    }

    @PostMapping("/budget-years")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BudgetYear> createBudgetYear(@RequestBody BudgetYear budgetYear) {
        BudgetYear saved = budgetYearRepository.save(budgetYear);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/report-non-senders")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER', 'ADMIN')")
    public ResponseEntity<List<Organization>> getReportNonSenders(
            @RequestParam String reportype,
            @RequestParam String fiscalYear) {
        try {
            List<Organization> nonSenders = masterTransactionService.getReportNonSenders(reportype, fiscalYear);
            return ResponseEntity.ok(nonSenders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    @GetMapping("/reports-by-org")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER','ADMIN')")
    public ResponseEntity<List<MasterTransactionDTO>> getReportsByOrgAndFilters(
            @RequestParam String reportype,
            @RequestParam String fiscalYear,
            @RequestParam String orgId) {
        List<MasterTransactionDTO> reports = masterTransactionService.getReportsByOrgAndFilters(reportype, fiscalYear, orgId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/organizations-with-reports")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER','ADMIN')")
    public ResponseEntity<List<Organization>> getAllOrganizationsWithReports() {
        List<Organization> organizations = masterTransactionService.getAllOrganizationsWithReports();
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/feedback-non-senders")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER','ADMIN')")
    public ResponseEntity<List<Organization>> getFeedbackNonSenders(
            @RequestParam String reportype,
            @RequestParam String fiscalYear) {
        try {
            List<Organization> nonSenders = masterTransactionService.getFeedbackNonSenders(reportype, fiscalYear);
            return ResponseEntity.ok(nonSenders);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    @GetMapping("/feedback-senders")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER','ADMIN')")
    public ResponseEntity<List<MasterTransactionDTO>> getFeedbackSenders(
            @RequestParam String reportype,
            @RequestParam String fiscalYear) {
        List<MasterTransactionDTO> senders = masterTransactionService.getFeedbackSenders(reportype, fiscalYear);
        return ResponseEntity.ok(senders);
    }

    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER', 'ARCHIVER', 'ADMIN', 'USER', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam String fiscalYear) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalOrganizations", masterTransactionService.getTotalOrganizations());
            stats.put("totalReportTypes", masterTransactionService.getTotalReportTypes());
            stats.put("totalDocuments", masterTransactionService.getTotalReportTypes());
            stats.put("totalUsers", userRepository.count());
            stats.put("reportTypeStats", masterTransactionService.getAllReportTypeStats(fiscalYear));
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch dashboard stats: " + e.getMessage()));
        }
    }

    @GetMapping("/file-history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<MasterTransactionDTO>> getFileHistory(Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            throw new IllegalStateException("User not found: " + principal.getName());
        }
        List<MasterTransactionDTO> history = masterTransactionService.getTransactionHistory(user.getId());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/letters")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ARCHIVER')")
    public ResponseEntity<List<MasterTransactionDTO>> getLettersForOrganization(
            Principal principal, 
            @RequestParam(value = "type", required = false) String type) {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null || user.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.emptyList());
        }
        String orgId = user.getOrganization().getId();
        
        List<MasterTransaction> transactions = new ArrayList<>();
        if ("dispatched".equalsIgnoreCase(type)) {
            transactions = masterTransactionRepository.findDispatchedLettersByOrganization(orgId);
        } else {
            transactions = masterTransactionRepository.findTransactionsWithLettersByOrganization(orgId);
            transactions.addAll(masterTransactionRepository.findDispatchedLettersByOrganization(orgId));
        }
        
        List<MasterTransactionDTO> dtos = transactions.stream()
            .map(MasterTransactionDTO::new)
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/reassign/{transactionId}")
    @PreAuthorize("hasRole('ARCHIVER')")
    public ResponseEntity<?> reassignTask(
            @PathVariable Integer transactionId,
            @RequestParam String auditorUsername,
            Principal principal) {
        try {
            MasterTransaction transaction = masterTransactionService.reassignTask(transactionId, auditorUsername, principal.getName());
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reassign task: " + e.getMessage()));
        }
    }

    @GetMapping("/advanced-filters")
@PreAuthorize("hasAnyRole('ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER', 'ADMIN')")
public ResponseEntity<?> getAdvancedFilters(
        @RequestParam String filterType,
        @RequestParam(required = false) String reportype,
        @RequestParam(required = false) String fiscalYear,
        @RequestParam(required = false) String orgId) {
    try {
        switch (filterType) {
            case "report-non-senders":
                if (StringUtils.isBlank(reportype) || StringUtils.isBlank(fiscalYear)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Report type and fiscal year are required"));
                }
                List<Organization> nonSenders = masterTransactionService.getReportNonSenders(reportype, fiscalYear);
                return ResponseEntity.ok(nonSenders);
            case "reports-by-org":
                if (StringUtils.isBlank(reportype) || StringUtils.isBlank(fiscalYear) || StringUtils.isBlank(orgId)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Report type, fiscal year, and organization ID are required"));
                }
                List<MasterTransactionDTO> reports = masterTransactionService.getReportsByOrgAndFilters(reportype, fiscalYear, orgId);
                return ResponseEntity.ok(reports);
            case "orgs-with-reports":
                List<Organization> orgsWithReports = masterTransactionService.getAllOrganizationsWithReports();
                return ResponseEntity.ok(orgsWithReports);
            case "feedback-non-senders":
                if (StringUtils.isBlank(reportype) || StringUtils.isBlank(fiscalYear)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Report type and fiscal year are required"));
                }
                List<Organization> feedbackNonSenders = masterTransactionService.getFeedbackNonSenders(reportype, fiscalYear);
                return ResponseEntity.ok(feedbackNonSenders);
            case "feedback-senders":
                if (StringUtils.isBlank(reportype) || StringUtils.isBlank(fiscalYear)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Report type and fiscal year are required"));
                }
                List<MasterTransactionDTO> feedbackSenders = masterTransactionService.getFeedbackSenders(reportype, fiscalYear);
                return ResponseEntity.ok(feedbackSenders);
            default:
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid filter type"));
        }
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch data: " + e.getMessage()));
    }
}
@PostMapping("/dispatch-letter")
@PreAuthorize("hasRole('APPROVER')")
public ResponseEntity<?> dispatchDocument(
        @RequestParam("letter") MultipartFile letter,
        @RequestParam("organizationIds") String organizationIdsJson,
        Principal principal) {
    try {
        // Check file size (500MB = 500 * 1024 * 1024 bytes)
        long maxFileSize = 500 * 1024 * 1024; // 500MB in bytes
        if (letter.getSize() > maxFileSize) {
            return ResponseEntity.badRequest().body(Map.of("error", "Your file exceeds maximum size of 500MB."));
        }

        // Parse organizationIds from JSON string
        ObjectMapper objectMapper = new ObjectMapper();
        List<String> organizationIds = objectMapper.readValue(organizationIdsJson, new TypeReference<List<String>>() {});

        MasterTransaction transaction = masterTransactionService.dispatchDocumentToOrganizations(
                letter, organizationIds, principal.getName());
        return ResponseEntity.ok(transaction);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (IOException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to store file: " + e.getMessage()));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Unexpected error: " + e.getMessage()));
    }
}


}