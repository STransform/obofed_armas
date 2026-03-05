import React, { useState, useEffect } from 'react';
import { CForm, CFormLabel, CFormSelect, CFormInput, CCol } from '@coreui/react';
import { Button, Alert } from '@mui/material';
import { getDocuments, uploadFile, getBudgetYears } from '../file/upload_download';

const FileUpload = ({ onUploadSuccess }) => {
    const [formData, setFormData] = useState({
        reportcategory: 'Report',
        budgetYearId: '',
        transactiondocumentid: '',
    });
    const [file, setFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [budgetYears, setBudgetYears] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docs, years] = await Promise.all([getDocuments(), getBudgetYears()]);
                console.log('Documents:', docs);
                console.log('Budget Years:', years);
                setDocuments(docs);
                setBudgetYears(years);
                if (docs.length > 0) {
                    setFormData(prev => ({ ...prev, transactiondocumentid: String(docs[0].id) }));
                }
                if (years.length > 0) {
                    setFormData(prev => ({ ...prev, budgetYearId: String(years[0].id) }));
                }
            } catch (err) {
                console.error('Failed to load data:', err.message);
                setError(`Failed to load data: ${err.message}`);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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
            console.log('Selected file:', selectedFile?.name, 'Size:', selectedFile?.size / (1024 * 1024), 'MB');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }
        const maxFileSize = 500 * 1024 * 1024; // 500MB in bytes
        if (file.size > maxFileSize) {
            setError('Your file exceeds maximum size of 500MB.');
            return;
        }
        if (!formData.budgetYearId) {
            setError('Please select a budget year');
            return;
        }
        if (!formData.transactiondocumentid) {
            setError('Please select a report type');
            return;
        }

        try {
            setError('');
            setSuccess('');
            await uploadFile(file, formData.reportcategory, Number(formData.budgetYearId), String(formData.transactiondocumentid));
            setSuccess('File uploaded successfully');
            setFile(null);
            setFormData({
                reportcategory: 'Report',
                budgetYearId: budgetYears.length > 0 ? String(budgetYears[0].id) : '',
                transactiondocumentid: documents.length > 0 ? String(documents[0].id) : '',
            });
            e.target.reset();
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message || 'File upload failed';
            setError(errorMessage);
            setSuccess('');
            console.error('Upload error:', errorMessage, err.response?.status, err.response?.data);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Upload Your Reports</h2>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <CForm className="row g-3" onSubmit={handleSubmit}>
                <CCol md={6}>
                    <CFormLabel htmlFor="reportcategory">Report Category</CFormLabel>
                    <CFormSelect
                        id="reportcategory"
                        name="reportcategory"
                        value={formData.reportcategory}
                        onChange={handleChange}
                    >
                        <option value="Report">Report</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Others">Others</option>
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormLabel htmlFor="budgetYearId">Budget Year</CFormLabel>
                    <CFormSelect
                        id="budgetYearId"
                        name="budgetYearId"
                        value={formData.budgetYearId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Budget Year</option>
                        {budgetYears.map(year => (
                            <option key={year.id} value={year.id}>
                                {year.fiscalYear}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormLabel htmlFor="transactiondocumentid">Report Type</CFormLabel>
                    <CFormSelect
                        id="transactiondocumentid"
                        name="transactiondocumentid"
                        value={formData.transactiondocumentid}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Report Type</option>
                        {documents.map(doc => (
                            <option key={doc.id} value={doc.id}>
                                {doc.reportype}
                            </option>
                        ))}
                    </CFormSelect>
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

export default FileUpload;