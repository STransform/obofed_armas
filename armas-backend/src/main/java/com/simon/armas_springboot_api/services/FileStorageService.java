package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.models.MasterTransaction;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
@Service
public class FileStorageService {
    public String storeFile(MultipartFile file, MasterTransaction trans, Principal principal, boolean isSupporting) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided for upload.");
        }

        String originalDocname = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file");
        String createdBy = principal.getName();
        String uploadDir = "C:/AMSReports/" + createdBy + "/";
        Path uploadPath = Paths.get(uploadDir);

        try {
            Files.createDirectories(uploadPath);
            System.out.println("Created directory: " + uploadPath);
        } catch (IOException e) {
            throw new IOException("Could not create directory: " + uploadPath, e);
        }

        Path filePath = uploadPath.resolve(originalDocname);
        // Allow overwrite to match migration behavior
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("Stored file: " + filePath + ", original name: " + originalDocname);
            if (!isSupporting) {
                trans.setDocname(originalDocname);
                trans.setFilepath(filePath.toString());
            } else {
                trans.setSupportingDocname(originalDocname);
                trans.setSupportingDocumentPath(filePath.toString());
            }
            return filePath.toString();
        } catch (IOException ioe) {
            throw new IOException("Could not save file: " + originalDocname + " at " + uploadPath, ioe);
        }
    }

    // New method to validate and copy files from old system
    public void validateAndCopyMigratedFiles(MasterTransaction trans) throws IOException {
        String[] pathsToCheck = {trans.getFilepath(), trans.getSupportingDocumentPath(), trans.getLetterPath()};
        String[] names = {trans.getDocname(), trans.getSupportingDocname(), trans.getLetterDocname()};
        String[] types = {"original", "supporting", "letter"};

        for (int i = 0; i < pathsToCheck.length; i++) {
            if (pathsToCheck[i] != null && names[i] != null) {
                Path targetPath = Paths.get(pathsToCheck[i]);
                if (!Files.exists(targetPath)) {
                    // Assume old system files are in a known directory (adjust as needed)
                    Path sourcePath = Paths.get("C:/AMSReportsOld/" + trans.getLastModifiedBy() + "/" + names[i]);
                    if (Files.exists(sourcePath)) {
                        Files.createDirectories(targetPath.getParent());
                        Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
                        System.out.println("Copied migrated file: " + sourcePath + " to " + targetPath);
                    } else {
                        System.err.println("Migrated file not found: " + sourcePath + " for " + types[i]);
                    }
                }
            }
        }
    }
}