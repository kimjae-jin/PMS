import { formatNumberWithCommas, formatDate } from './utils.js';

const { jsPDF } = window.jspdf;

function setupDoc(doc, title) {
    doc.addFont('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/SpoqaHanSansNeo-Regular.woff', 'SpoqaHanSansNeo', 'normal');
    doc.setFont('SpoqaHanSansNeo');

    doc.setFontSize(22);
    doc.text(title, 105, 25, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);
}

function drawSection(doc, y, title, content) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(title, 20, y);
    doc.setTextColor(0);
    doc.text(content || '-', 60, y);
    return y + 9;
}


export function generateContractPDF(data) {
    const doc = new jsPDF();
    setupDoc(doc, '계 약 서');
    
    let y = 50;
    y = drawSection(doc, y, '프로젝트명:', data.name);
    y = drawSection(doc, y, '프로젝트 ID:', data.projectId);
    y = drawSection(doc, y, '거래처:', data.clientName);
    y = drawSection(doc, y, '계약일:', formatDate(data.contractDate));
    y = drawSection(doc, y, '착수일:', formatDate(data.startDate));
    y = drawSection(doc, y, '종료예정일:', formatDate(data.endDate));
    y += 5;
    
    doc.text('상기 프로젝트에 대하여 아래와 같이 계약을 체결함.', 20, y);
    y += 20;

    doc.text('갑 (Client):', 30, y);
    doc.text(data.clientName, 90, y);

    y += 20;
    doc.text('을 (Provider):', 30, y);
    doc.text('Flowith.io', 90, y);

    doc.save(`계약서_${data.projectId}.pdf`);
}

export function generateStartCertPDF(data) {
    const doc = new jsPDF();
    setupDoc(doc, '착 수 계');
    let y = 50;
    y = drawSection(doc, y, '공사명:', data.name);
    y = drawSection(doc, y, '계약일:', formatDate(data.contractDate));
    y = drawSection(doc, y, '착수일:', formatDate(data.startDate));
    y = drawSection(doc, y, '준공기한:', formatDate(data.endDate));
    y += 10;
    doc.text('위와 같이 착수하였기에 착수계를 제출합니다.', 20, y);
    doc.save(`착수계_${data.projectId}.pdf`);
}

export function generateCompleteCertPDF(data) {
    const doc = new jsPDF();
    setupDoc(doc, '완 료 계');
    let y = 50;
    y = drawSection(doc, y, '공사명:', data.name);
    y = drawSection(doc, y, '계약일:', formatDate(data.contractDate));
    y = drawSection(doc, y, '착수일:', formatDate(data.startDate));
    y = drawSection(doc, y, '완료일:', formatDate(data.endDate));
    y += 10;
    doc.text('위 공사의 전 공정이 완료되었음을 확인하며 완료계를 제출합니다.', 20, y);
    doc.save(`완료계_${data.projectId}.pdf`);
}

export function generateInvoicePDF(data) {
    const doc = new jsPDF();
    setupDoc(doc, '청 구 서');
    let y = 50;
    y = drawSection(doc, y, '청구 번호:', data.id.toString());
    y = drawSection(doc, y, '청구일:', formatDate(data.invoiceDate));
    y = drawSection(doc, y, '청구 내용:', data.invoiceContent);
    y = drawSection(doc, y, '청구 금액:', `${formatNumberWithCommas(data.invoiceAmount)} 원`);
    y += 10;
    doc.text('상기 금액을 청구하오니 아래 계좌로 입금 바랍니다.', 20, y);
    y += 10;
    y = drawSection(doc, y, '은행명:', '플로우 은행');
    y = drawSection(doc, y, '계좌번호:', '123-456-789012');
    y = drawSection(doc, y, '예금주:', 'Flowith.io');

    doc.save(`청구서_${data.id}.pdf`);
}

export function generateQuotationPDF(data) {
    const doc = new jsPDF();
    setupDoc(doc, '견 적 서');
    
    let y = 45;
    doc.setFontSize(12);
    doc.text(`수신: ${data.recipientName} 귀하`, 20, y);
    doc.text(`견적번호: ${data.quotationNumber}`, 130, y);
    y += 7;
    doc.text(`작성일: ${formatDate(data.createdAt)}`, 130, y);
    y += 10;
    
    doc.line(14, y, 196, y);
    y += 10;
    
    doc.setFontSize(14);
    doc.text(`건명: ${data.provisionalContractName}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.text('아래와 같이 견적합니다.', 20, y);
    y += 15;
    
    doc.setFontSize(16);
    doc.text(`총 견적 금액: ${formatNumberWithCommas(data.quotationAmount)} 원`, 105, y, { align: 'center'});
    y+= 10;
    
    doc.line(14, y, 196, y);
    y += 15;

    doc.setFontSize(11);
    doc.text(`비고: ${data.remarks || '없음'}`, 20, y);

    doc.save(`견적서_${data.quotationNumber}.pdf`);
}
