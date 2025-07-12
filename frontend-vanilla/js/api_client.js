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
        console.error("Could not load or parse mock data:", e);
        return { projects: [], contracts: [], clients: [], invoices: [], quotations: [], project_participants: [] };
    }
};

const persistData = (data) => {
    cachedData = data;
};

const simulateNetworkDelay = (delay = 200) => new Promise(res => setTimeout(res, delay));

const findById = (collection, id) => collection.find(item => item.id === parseInt(id));
const findIndexById = (collection, id) => collection.findIndex(item => item.id === parseInt(id));

export const apiClient = {
    getProjects: async () => {
        await simulateNetworkDelay();
        const data = await getMockData();
        return data.projects.map(p => ({
            ...p,
            clientName: data.clients.find(c => c.id === p.clientId)?.clientName || '미지정'
        }));
    },
    getProjectById: async (projectId) => {
        await simulateNetworkDelay();
        const data = await getMockData();
        const project = data.projects.find(p => p.projectId === projectId);
        if (!project) throw new Error("Project not found");
        return {
            ...project,
            client: data.clients.find(c => c.id === project.clientId)
        };
    },
    createProject: async (projectData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        
        const lastProject = data.projects[data.projects.length - 1];
        const newId = (lastProject ? lastProject.id : 0) + 1;
        const year = new Date().getFullYear();
        const lastProjectOfTheYear = data.projects.filter(p=>p.projectId.startsWith(`P${year}`)).length;
        const newProjectId = `P${year}-${String(lastProjectOfTheYear + 1).padStart(3, '0')}`;

        const newProject = {
            id: newId,
            projectId: newProjectId,
            name: projectData.name,
            clientId: parseInt(projectData.clientId),
            startDate: projectData.startDate,
            endDate: projectData.endDate,
            status: "IN_PROGRESS",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.projects.push(newProject);
        persistData(data);
        return newProject;
    },
    updateProject: async (projectId, updateData) => {
        await simulateNetworkDelay(500);
        const data = await getMockData();
        const projectIndex = data.projects.findIndex(p => p.projectId === projectId);
        if (projectIndex === -1) throw new Error("Project not found");
        
        const updated = { ...data.projects[projectIndex], ...updateData, updatedAt: new Date().toISOString() };
        if(updateData.clientId) updated.clientId = parseInt(updateData.clientId);
        data.projects[projectIndex] = updated;
        
        persistData(data);
        return updated;
    },

    getClients: async () => { await simulateNetworkDelay(); return (await getMockData()).clients; },
    getClientById: async (id) => { await simulateNetworkDelay(); return findById((await getMockData()).clients, id); },
    createClient: async (clientData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const newClient = { ...clientData, id: Date.now(), createdAt: new Date().toISOString() };
        data.clients.push(newClient);
        persistData(data);
        return newClient;
    },
    updateClient: async (id, updateData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const index = findIndexById(data.clients, id);
        if (index === -1) throw new Error("Client not found");
        data.clients[index] = { ...data.clients[index], ...updateData };
        persistData(data);
        return data.clients[index];
    },
    deleteClient: async (id) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        data.clients = data.clients.filter(c => c.id !== parseInt(id));
        persistData(data);
        return true;
    },

    getQuotations: async () => { await simulateNetworkDelay(); return (await getMockData()).quotations; },
    getQuotationById: async (id) => { await simulateNetworkDelay(); return findById((await getMockData()).quotations, id); },
    createQuotation: async (quoteData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const year = new Date().getFullYear();
        const lastQuote = data.quotations.filter(q => q.quotationNumber.startsWith(`Q${year}`)).sort((a,b) => b.quotationNumber.localeCompare(a.quotationNumber))[0];
        let newIdNumber = 1;
        if (lastQuote) newIdNumber = parseInt(lastQuote.quotationNumber.split('-')[1]) + 1;
        
        const newQuote = { 
            ...quoteData, 
            id: Date.now(), 
            quotationNumber: `Q${year}-${String(newIdNumber).padStart(4, '0')}`,
            createdAt: new Date().toISOString()
        };
        data.quotations.push(newQuote);
        persistData(data);
        return newQuote;
    },
    updateQuotation: async (id, updateData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const index = findIndexById(data.quotations, id);
        if (index === -1) throw new Error("Quotation not found");
        data.quotations[index] = { ...data.quotations[index], ...updateData };
        persistData(data);
        return data.quotations[index];
    },
    deleteQuotation: async (id) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        data.quotations = data.quotations.filter(q => q.id !== parseInt(id));
        persistData(data);
        return true;
    },

    getInvoicesForContract: async (contractId) => {
        await simulateNetworkDelay();
        if (!contractId) return [];
        const data = await getMockData();
        return data.invoices.filter(i => i.contractId === parseInt(contractId));
    },
    createInvoice: async (contractId, invoiceData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const newInvoice = { ...invoiceData, id: Date.now(), contractId: parseInt(contractId) };
        data.invoices.push(newInvoice);
        persistData(data);
        return newInvoice;
    },
    updateInvoice: async (id, updateData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const index = findIndexById(data.invoices, id);
        if (index === -1) throw new Error("Invoice not found");
        data.invoices[index] = { ...data.invoices[index], ...updateData };
        persistData(data);
        return data.invoices[index];
    },
    deleteInvoice: async (id) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        data.invoices = data.invoices.filter(i => i.id !== parseInt(id));
        persistData(data);
        return true;
    },

    getParticipantsForProject: async (projectId) => {
        await simulateNetworkDelay();
        const data = await getMockData();
        const project = data.projects.find(p => p.projectId === projectId);
        if (!project) return [];
        return data.project_participants.filter(p => p.projectId === project.id);
    },
    createParticipant: async (projectId, participantData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const project = data.projects.find(p => p.projectId === projectId);
        if (!project) throw new Error("Project not found");
        const newParticipant = { ...participantData, id: Date.now(), projectId: project.id };
        data.project_participants.push(newParticipant);
        persistData(data);
        return newParticipant;
    },
    updateParticipant: async (id, updateData) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        const index = findIndexById(data.project_participants, id);
        if (index === -1) throw new Error("Participant not found");
        data.project_participants[index] = { ...data.project_participants[index], ...updateData };
        persistData(data);
        return data.project_participants[index];
    },
    deleteParticipant: async (id) => {
        await simulateNetworkDelay(400);
        const data = await getMockData();
        data.project_participants = data.project_participants.filter(p => p.id !== parseInt(id));
        persistData(data);
        return true;
    },

    getActiveContractForProject: async (projectId) => {
        await simulateNetworkDelay();
        const data = await getMockData();
        const project = data.projects.find(p => p.projectId === projectId);
        if (!project) throw new Error("Project not found");
        return data.contracts.find(c => c.projectId === project.id && c.isActive);
    },
};
