import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormInput, CCol } from '@coreui/react';
import { Button, Alert, Autocomplete, TextField, Chip } from '@mui/material';
import axiosInstance from '../axiosConfig';

const UploadToOrganizations = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrganizations, setSelectedOrganizations] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/transactions/organizations-with-reports');
                console.log('Fetched organizations:', response.data); // Debug log
                setOrganizations(response.data);
            } catch (err) {
                setError(`Failed to load organizations: ${err.message}`);
            }
        };
        fetchData();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const maxSizeInBytes = 500 * 1024 * 1024; // 500MB
        if (selectedFile && selectedFile.size > maxSizeInBytes) {
            setError('File size exceeds the maximum limit of 500MB');
            setFile(null);
            e.target.value = null;
        } else {
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }
        if (selectedOrganizations.length === 0) {
            setError('Please select at least one organization');
            return;
        }

        // Validate organization IDs
        const validOrgIds = selectedOrganizations.filter(org => organizations.some(o => o.id === org.id));
        if (validOrgIds.length !== selectedOrganizations.length) {
            setError('One or more selected organizations are invalid');
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('letter', file);
        formDataToSend.append('organizationIds', JSON.stringify(selectedOrganizations.map(org => org.id)));

        try {
            setError('');
            setSuccess('');
            await axiosInstance.post('/transactions/dispatch-letter', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess('Letter dispatched successfully');
            setFile(null);
            setSelectedOrganizations([]);
            e.target.reset();
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'Letter dispatch failed';
            setError(errorMessage);
            setSuccess('');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Upload to Organizations</h2>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={6}>
                    <CFormLabel htmlFor="organizations">Organizations</CFormLabel>
                    <Autocomplete
                        multiple
                        id="organizations"
                        options={organizations}
                        getOptionLabel={(option) => option.orgname}
                        value={selectedOrganizations}
                        onChange={(event, newValue) => setSelectedOrganizations(newValue)}
                        renderInput={(params) => (
                            <TextField {...params} variant="outlined" placeholder="Select Organizations" />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip label={option.orgname} {...getTagProps({ index })} />
                            ))
                        }
                    />
                </CCol>
                <CCol md={6}>
                    <CFormLabel htmlFor="file">Choose File</CFormLabel>
                    <CFormInput type="file" id="file" onChange={handleFileChange} required />
                </CCol>
                <CCol xs={12}>
                    <Button type="submit" variant="contained" color="primary">
                        Submit
                    </Button>
                </CCol>
            </CForm>
        </div>
    );
};

export default UploadToOrganizations;