package com.simon.armas_springboot_api.services;

import java.nio.file.*;
import java.sql.*;

public class FileMigration {
    public static void main(String[] args) {
        String jdbcUrl = "jdbc:mysql://localhost:3306/mof_irms?useSSL=false";
        String username = "root";
        String password = "Simon@1234";
        String oldBasePath = "C:/AMSReportsOld/";
        String newBasePath = "C:/AMSReports/";

        try (Connection conn = DriverManager.getConnection(jdbcUrl, username, password)) {
            String sql = "SELECT id, supporting_docname, supporting_document_path, letter_docname, letter_path, last_modified_by " +
                         "FROM master_transaction " +
                         "WHERE (supporting_document_path IS NOT NULL AND supporting_docname IS NOT NULL) " +
                         "   OR (letter_path IS NOT NULL AND letter_docname IS NOT NULL)";
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                int id = rs.getInt("id");
                String supportingDocname = rs.getString("supporting_docname");
                String supportingPath = rs.getString("supporting_document_path");
                String letterDocname = rs.getString("letter_docname");
                String letterPath = rs.getString("letter_path");
                String lastModifiedBy = rs.getString("last_modified_by");

                // Check and copy supporting document
                if (supportingPath != null && supportingDocname != null) {
                    Path targetPath = Paths.get(supportingPath);
                    if (!Files.exists(targetPath)) {
                        Path sourcePath = Paths.get(oldBasePath, lastModifiedBy, supportingDocname);
                        if (Files.exists(sourcePath)) {
                            Files.createDirectories(targetPath.getParent());
                            Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
                            System.out.println("Copied: " + sourcePath + " to " + targetPath);
                        } else {
                            System.err.println("Source file not found for ID=" + id + ": " + sourcePath);
                        }
                    }
                }

                // Check and copy letter
                if (letterPath != null && letterDocname != null) {
                    Path targetPath = Paths.get(letterPath);
                    if (!Files.exists(targetPath)) {
                        Path sourcePath = Paths.get(oldBasePath, lastModifiedBy, letterDocname);
                        if (Files.exists(sourcePath)) {
                            Files.createDirectories(targetPath.getParent());
                            Files.copy(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
                            System.out.println("Copied: " + sourcePath + " to " + targetPath);
                        } else {
                            System.err.println("Source file not found for ID=" + id + ": " + sourcePath);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
