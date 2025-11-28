
export type Language = 'pt' | 'en';

export const translations = {
  en: {
    appTitle: "ColectorPro",
    searchPlaceholder: "Search Name...",
    brandPlaceholder: "Filter by Brand...",
    modelPlaceholder: "Filter by Model...",
    categoryAll: "All Categories",
    addCar: "Add Car",
    noCarsTitle: "No cars found",
    noCarsSubtitle: "Get started by adding a new car to your collection.",
    noCarsFilter: "Try adjusting your filters.",
    deleteConfirm: "Are you sure you want to delete this car?",
    
    // Server Config
    serverConfigTitle: "Server Connection",
    storageMode: "Storage Mode",
    modeLocal: "Local (Offline / This Device)",
    modeServer: "Remote Server (Centralized)",
    serverUrl: "Server URL",
    serverUrlPlaceholder: "e.g., http://192.168.1.5:3001",
    saveConfig: "Save Configuration",
    connectionError: "Could not connect to server.",
    switchToLocal: "Switch to Local Mode",
    
    // Form
    formTitle: "Add New Car",
    formTitleEdit: "Edit Car",
    uploadText: "Click to upload photos",
    addMorePhotos: "Add Photos",
    mainPhoto: "Main Cover",
    changeImage: "Change Image",
    aiEditorTitle: "AI Image Editor",
    aiEditorDesc: "Power-up the selected photo with Gemini!",
    aiPlaceholder: "e.g., Add blue neon lights...",
    generate: "Generate",
    nameLabel: "Name / Nickname",
    brandLabel: "Brand",
    modelLabel: "Model",
    categoryLabel: "Category",
    cancel: "Cancel",
    save: "Save to Garage",
    update: "Update Car",
    errorFile: "File size too large (max 5MB)",
    errorReq: "Please provide a name and at least one image.",
    errorGen: "Failed to generate image. Please try again.",
    
    // Details
    detailsTitle: "Car Details",
    close: "Close",
    
    // Card
    added: "Added",
  },
  pt: {
    appTitle: "ColectorPro",
    searchPlaceholder: "Buscar Nome...",
    brandPlaceholder: "Filtrar por Marca...",
    modelPlaceholder: "Filtrar por Modelo...",
    categoryAll: "Todas Categorias",
    addCar: "Adicionar Carro",
    noCarsTitle: "Nenhum carro encontrado",
    noCarsSubtitle: "Comece adicionando um novo carro à sua garagem.",
    noCarsFilter: "Tente ajustar seus filtros.",
    deleteConfirm: "Tem certeza que deseja excluir este carro?",
    
    // Server Config
    serverConfigTitle: "Conexão com Servidor",
    storageMode: "Modo de Armazenamento",
    modeLocal: "Local (Offline / Este Dispositivo)",
    modeServer: "Servidor Remoto (Centralizado)",
    serverUrl: "URL do Servidor",
    serverUrlPlaceholder: "ex: http://192.168.0.15:3001",
    saveConfig: "Salvar Configuração",
    connectionError: "Não foi possível conectar ao servidor. Verifique se o server.js está rodando.",
    switchToLocal: "Mudar para Local",
    
    // Form
    formTitle: "Adicionar Novo Carro",
    formTitleEdit: "Editar Carro",
    uploadText: "Clique para enviar fotos",
    addMorePhotos: "Add Fotos",
    mainPhoto: "Capa Principal",
    changeImage: "Alterar Imagem",
    aiEditorTitle: "Editor de Imagem IA",
    aiEditorDesc: "Turbine a foto selecionada com Gemini!",
    aiPlaceholder: "ex: Adicionar luzes neon azuis...",
    generate: "Gerar",
    nameLabel: "Nome / Apelido",
    brandLabel: "Marca",
    modelLabel: "Modelo",
    categoryLabel: "Categoria",
    cancel: "Cancelar",
    save: "Salvar na Garagem",
    update: "Atualizar Carro",
    errorFile: "Arquivo muito grande (max 5MB)",
    errorReq: "Por favor forneça nome e pelo menos uma imagem.",
    errorGen: "Falha ao gerar imagem. Tente novamente.",
    
    // Details
    detailsTitle: "Detalhes do Carro",
    close: "Fechar",
    
    // Card
    added: "Add",
  }
};