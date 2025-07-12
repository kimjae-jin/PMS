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
        return { projects: [], contracts: [], contractRevisions: [], clients: [], quotations: [] };
    }
};

const persistData = (data) => {
    cachedData = data;
};

const simulateNetworkDelay = (delay = 150) => new Promise(res => setTimeout(res, delay));
const findById = (collection, id) => collection.find(item => item.id === parseInt(id));


// --- API 클라이언트 객체 ---
export const apiClient = {
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

    // --- Client APIs (관계사 CRUD) ---
    getClients: async () => { 
        await simulateNetworkDelay(); 
        return (await getMockData()).clients; 
    },
    getClientById: async (id) => {
        await simulateNetworkDelay();
        return findById((await getMockData()).clients, id);
    },
    createClient: async (clientData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const newClient = { 
            id: Date.now(), // 고유 ID 생성
            ...clientData 
        };
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

    // --- Quotation APIs (견적 CRUD) ---
    getQuotations: async () => {
        await simulateNetworkDelay();
        return (await getMockData()).quotations;
    },
    getQuotationById: async (id) => {
        await simulateNetworkDelay();
        return findById((await getMockData()).quotations, id);
    },
    createQuotation: async (quotationData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const newQuotation = { 
            id: Date.now(), // 고유 ID 생성
            quotationId: `Q${Date.now()}`, // 임시 고유 ID
            ...quotationData 
        };
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
