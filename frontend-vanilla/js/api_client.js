// --- 가상 데이터베이스 및 기본 설정 ---
const DATA_FILE = 'data/mock_data.json';
let cachedData = null;

const getMockData = async () => {
    if (cachedData) return JSON.parse(JSON.stringify(cachedData));
    try {
        const response = await fetch(DATA_FILE);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        cachedData = await response.json();
        return JSON.parse(JSON.stringify(cachedData));
    } catch (e) {
        console.error("Could not load mock data:", e);
        return { projects: [], contracts: [], contractRevisions: [], clients: [], quotations: [], employees: [], projectParticipants: [] };
    }
};

const persistData = (data) => {
    cachedData = data;
};

const simulateNetworkDelay = (delay = 150) => new Promise(res => setTimeout(res, delay));
const findById = (collection, id) => collection.find(item => item.id === parseInt(id));


// --- API 클라이언트 객체 ---
export const apiClient = {
    // --- Dashboard & Summary API ---
    getDashboardSummary: async () => {
        await simulateNetworkDelay(200);
        const data = await getMockData();
        const inProgressProjects = data.projects.filter(p => p.status === '진행중').length;
        const expiringDocuments = 2; const dailyIssues = 3; const pendingInvoices = 1;
        return { inProgressProjects, expiringDocuments, dailyIssues, pendingInvoices };
    },
    
    // --- Project APIs ---
    getProjects: async () => {
        await simulateNetworkDelay();
        return (await getMockData()).projects;
    },
    getProjectById: async (projectId) => {
        await simulateNetworkDelay();
        const data = await getMockData();
        const project = data.projects.find(p => p.projectId === projectId);
        if (!project) throw new Error("Project not found");
        
        const contract = data.contracts.find(c => c.projectId === project.id);
        const revisions = contract ? data.contractRevisions.filter(r => r.contractId === contract.id) : [];

        return {
            ...project,
            contract: contract || null,
            revisions: revisions.sort((a,b) => a.revisionNumber - b.revisionNumber)
        };
    },
    createProject: async (formData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        
        // 1. 새 프로젝트 객체 생성
        const lastProject = data.projects.sort((a,b) => b.id - a.id)[0];
        const newProjectId = (lastProject ? lastProject.id : 0) + 1;
        const year = new Date().getFullYear();
        const projectOfTheYearCount = data.projects.filter(p=>p.projectId.startsWith(`P${year}`)).length;
        
        const newProject = { 
            id: newProjectId,
            projectId: `P${year}-${String(projectOfTheYearCount + 1).padStart(3, '0')}`,
            clientId: parseInt(formData.clientId),
            projectName: formData.projectName,
            projectCategory: formData.projectCategory,
            pmName: formData.pmName,
            projectLocation: formData.projectLocation,
            summary: formData.summary,
            facilityType: formData.facilityType,
            status: formData.status || '진행중',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.projects.push(newProject);

        // 2. 새 계약 객체 생성
        if (formData.contractDate) { // 계약일이 있는 경우에만 계약 생성
            const lastContract = data.contracts.sort((a,b) => b.id - a.id)[0];
            const newContractId = (lastContract ? lastContract.id : 100) + 1;
            const newContract = {
                id: newContractId,
                projectId: newProject.id, // 방금 만든 프로젝트 ID 연결
                contractId: formData.contractId,
                contractType: '최초',
                contractDate: formData.contractDate,
                startDate: formData.startDate,
                endDate: formData.endDate,
                totalAmount: parseFloat(String(formData.totalAmount).replace(/,/g, '')) || 0,
                supplyAmount: parseFloat(String(formData.supplyAmount).replace(/,/g, '')) || 0,
                vatAmount: parseFloat(String(formData.vatAmount).replace(/,/g, '')) || 0,
                totalEquityAmount: parseFloat(String(formData.totalEquityAmount).replace(/,/g, '')) || 0,
                equityRatio: parseFloat(formData.equityRatio) || 0,
                remarks: formData.remarks
            };
            data.contracts.push(newContract);
        }

        // 3. 참여 기술인 정보 저장 (formData에 participants가 배열로 넘어온다고 가정)
        if (formData.participants && formData.participants.length > 0) {
            formData.participants.forEach(p => {
                const lastParticipant = data.projectParticipants.sort((a,b) => b.participantId - a.id)[0];
                const newParticipantId = (lastParticipant ? lastParticipant.participantId : 0) + 1;
                data.projectParticipants.push({
                    participantId: newParticipantId,
                    projectId: newProject.id,
                    ...p
                });
            });
        }

        persistData(data);
        return newProject;
    },
    updateProject: async (id, updateData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const projectIndex = data.projects.findIndex(p => p.id === parseInt(id));
        if (projectIndex === -1) throw new Error("Project not found");
        
        data.projects[projectIndex] = { ...data.projects[projectIndex], ...updateData, updatedAt: new Date().toISOString() };
        persistData(data);
        return data.projects[projectIndex];
    },

    // --- Employee & Participant APIs ---
    getEmployees: async () => {
        await simulateNetworkDelay();
        return (await getMockData()).employees;
    },

    // --- Client APIs ---
    getClients: async () => { 
        await simulateNetworkDelay(); 
        return (await getMockData()).clients; 
    },
    createClient: async (clientData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const newClient = { id: Date.now(), ...clientData };
        data.clients.push(newClient);
        persistData(data);
        return newClient;
    },
    updateClient: async (id, updateData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const clientIndex = data.clients.findIndex(c => c.id === parseInt(id));
        if (clientIndex === -1) throw new Error("Client not found");
        data.clients[clientIndex] = { ...data.clients[clientIndex], ...updateData };
        persistData(data);
        return data.clients[clientIndex];
    },
    deleteClient: async (id) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        data.clients = data.clients.filter(c => c.id !== parseInt(id));
        persistData(data);
        return { success: true };
    },

    // --- Quotation APIs ---
    getQuotations: async () => {
        await simulateNetworkDelay();
        return (await getMockData()).quotations;
    },
    createQuotation: async (quotationData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const newQuotation = { id: Date.now(), quotationId: `Q${Date.now()}`, ...quotationData };
        data.quotations.push(newQuotation);
        persistData(data);
        return newQuotation;
    },
    updateQuotation: async (id, updateData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const quotationIndex = data.quotations.findIndex(q => q.id === parseInt(id));
        if (quotationIndex === -1) throw new Error("Quotation not found");
        data.quotations[quotationIndex] = { ...data.quotations[quotationIndex], ...updateData };
        persistData(data);
        return data.quotations[quotationIndex];
    },
    deleteQuotation: async (id) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        data.quotations = data.quotations.filter(q => q.id !== parseInt(id));
        persistData(data);
        return { success: true };
    },
};
