import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { TransformedWorkEntry, TransformedPaymentEntry, ReportFilters } from '../types/reports';

// Function to escape CSV fields
const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) {
        return '';
    }
    const stringField = String(field);
    // If the field contains a comma, double quote, or newline, wrap it in double quotes
    if (/[",\n]/.test(stringField)) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

// Function to convert data to CSV format
const convertToCsv = (
    workData: TransformedWorkEntry[],
    paymentData: TransformedPaymentEntry[],
    filters: ReportFilters
): string => {
    let csvString = '';
    const headers = {
        work: ['Date', 'Title', 'Notes', 'Quantity', 'Earning', 'Task Type'],
        payment: ['Date', 'Amount', 'From', 'Notes'],
    };

    if (filters.viewMode === 'work' || filters.viewMode === 'combined') {
        csvString += headers.work.join(',') + '\n';
        workData.forEach(item => {
            const row = [
                item.date,
                item.title,
                item.notes,
                item.quantity,
                item.calculated_earning,
                item.task_type_code,
            ].map(escapeCsvField).join(',');
            csvString += row + '\n';
        });
        csvString += '\n'; // Add a blank line between sections
    }

    if (filters.viewMode === 'payment' || filters.viewMode === 'combined') {
        csvString += headers.payment.join(',') + '\n';
        paymentData.forEach(item => {
            const row = [
                item.date,
                item.amount,
                item.from,
                item.notes,
            ].map(escapeCsvField).join(',');
            csvString += row + '\n';
        });
    }

    return csvString;
};

// Function to generate a basic HTML report
const generateHtmlReport = (
    workData: TransformedWorkEntry[],
    paymentData: TransformedPaymentEntry[],
    filters: ReportFilters,
    summary: any, // Pass summary data for the report
    t: (key: string) => string // Pass translation function
): string => {
    const { totalWorkRecords, totalWorkAmount, totalPaymentRecords, totalPaymentAmount } = summary;
    
    let workHtml = '';
    if (filters.viewMode === 'work' || filters.viewMode === 'combined') {
        workHtml = `
            <h2>${t('reportsPage.workEntriesTitle')}</h2>
            <p>${t('reportsPage.kpi.workTotalRecords')}: ${totalWorkRecords}</p>
            <p>${t('reportsPage.kpi.workTotalAmount')}: ${totalWorkAmount.toFixed(2)}</p>
            <table border="1" cellpadding="5" style="width:100%; border-collapse: collapse;">
                <tr>
                    <th>${t('date')}</th>
                    <th>${t('description')}</th>
                    <th>${t('quantity')}</th>
                    <th>${t('reportsPage.earning')}</th>
                    <th>${t('reportsPage.jobType')}</th>
                </tr>
                ${workData.map(item => `
                    <tr>
                        <td>${new Date(item.date).toLocaleDateString()}</td>
                        <td>${item.title || ''} ${item.notes ? `<br/><small><em>${item.notes}</em></small>` : ''}</td>
                        <td>${item.quantity}</td>
                        <td>${item.calculated_earning.toFixed(2)}</td>
                        <td>${item.task_type_code || 'N/A'}</td>
                    </tr>
                `).join('')}
            </table>
        `;
    }

    let paymentHtml = '';
    if (filters.viewMode === 'payment' || filters.viewMode === 'combined') {
        paymentHtml = `
            <h2>${t('reportsPage.paymentEntriesTitle')}</h2>
            <p>${t('reportsPage.kpi.paymentTotalRecords')}: ${totalPaymentRecords}</p>
            <p>${t('reportsPage.kpi.paymentTotalAmount')}: ${totalPaymentAmount.toFixed(2)}</p>
            <table border="1" cellpadding="5" style="width:100%; border-collapse: collapse;">
                <tr>
                    <th>${t('date')}</th>
                    <th>${t('amount')}</th>
                    <th>${t('from')}</th>
                    <th>${t('notes')}</th>
                </tr>
                ${paymentData.map(item => `
                    <tr>
                        <td>${new Date(item.date).toLocaleDateString()}</td>
                        <td>${item.amount.toFixed(2)}</td>
                        <td>${item.from || 'N/A'}</td>
                        <td>${item.notes || ''}</td>
                    </tr>
                `).join('')}
            </table>
        `;
    }

    return `
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: sans-serif; }
                    table { font-size: 12px; }
                    h1 { font-size: 20px; }
                    h2 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px;}
                </style>
            </head>
            <body>
                <h1>${t('reportsPage.title')}</h1>
                <p><strong>${t('reportPeriodLabel')}:</strong> ${new Date(filters.startDate!).toLocaleDateString()} - ${new Date(filters.endDate!).toLocaleDateString()}</p>
                ${workHtml}
                ${paymentHtml}
            </body>
        </html>
    `;
};


// Main export function
export const exportReportFile = async (
    format: 'pdf' | 'csv',
    workData: TransformedWorkEntry[],
    paymentData: TransformedPaymentEntry[],
    filters: ReportFilters,
    summary: any,
    t: (key: string) => string
) => {
    try {
        if (!workData.length && !paymentData.length) {
            throw new Error('No data to export.');
        }

        let content = '';
        let fileExtension = '';
        let mimeType = '';

        if (format === 'csv') {
            content = convertToCsv(workData, paymentData, filters);
            fileExtension = '.csv';
            mimeType = 'text/csv';
        } else { // 'pdf' will be handled by generating HTML
            content = generateHtmlReport(workData, paymentData, filters, summary, t);
            fileExtension = '.html';
            mimeType = 'text/html';
        }
        
        const fileName = `Checkhira-Report-${new Date().toISOString().split('T')[0]}${fileExtension}`;
        const fileUri = FileSystem.documentDirectory + fileName;

        await FileSystem.writeAsStringAsync(fileUri, content, {
            encoding: FileSystem.EncodingType.UTF8
        });

        if (!(await Sharing.isAvailableAsync())) {
            alert("Sharing is not available on this device.");
            return;
        }

        await Sharing.shareAsync(fileUri, {
            mimeType,
            dialogTitle: t('exportReportButton'),
        });

    } catch (error: any) {
        console.error("Export failed:", error);
        throw new Error(error.message || 'Export failed. Please try again.');
    }
}; 