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
        // 계획서에 명시된 모든 데이터 모델에 대한 기본 빈 배열을 반환하도록 수정
        return { 
            projects: [], 
            contracts: [], 
            contractRevisions: [],
            clients: [],
            invoices: [], 
            quotations: [], 
            project_participants: [] 
        };
    }
};

const persistData = (data) => {
    cachedData = data;
};

const simulateNetworkDelay = (delay = 150) => new Promise(res => setTimeout(res, delay));

const findById = (collection, id) => collection.find(item => item.id === parseInt(id));

export const apiClient = {
    // --- Project ---
    getProjects: async () => {
        await simulateNetworkDelay();
        const data = await getMockData();
        return data.projects;
    },
    getProjectById: async (projectId) => {
        await simulateNetworkDelay();
        const data = await getMockData();
        const project = data.projects.find(p => p.projectId === projectId);
        if (!project) throw new Error("Project not found");
        
        // 프로젝트에 연결된 계약과 변경 이력을 함께 반환
        const contract = data.contracts.find(c => c.projectId === project.id);
        const revisions = contract ? data.contractRevisions.filter(r => r.contractId === contract.id) : [];

        return {
            ...project,
            contract: contract || null,
            revisions: revisions.sort((a,b) => a.revisionNumber - b.revisionNumber) // 차수별로 정렬
        };
    },
    // --- Client ---
    getClients: async () => { 
        await simulateNetworkDelay(); 
        return (await getMockData()).clients; 
    },
    // ... 다른 API 함수들은 추후 단계에서 구현 ...
};
