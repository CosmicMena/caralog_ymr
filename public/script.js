// Seleciona os elementos
const btnTips = document.querySelector('.show-usage-tips');
const usageTips = document.querySelector('.usage-tips');

// Mostrar o painel quando o cursor passar ou clicar
btnTips.addEventListener('mouseenter', () => {
    usageTips.classList.add('active');
});

// Ocultar quando sair do foco do painel
usageTips.addEventListener('mouseleave', () => {
    usageTips.classList.remove('active');
});

// Variáveis globais
let produtos = [];
let produtosFiltrados = [];

// Elementos DOM
const produtosContainer = document.getElementById('produtos-container');
const searchInput = document.getElementById('search');
const formAdd = document.getElementById('form-add');
const btnGerar = document.getElementById('btn-gerar');
const btnToggleForm = document.getElementById('btn-toggle-form');
const addProductSection = document.getElementById('add-product-section');
const loadingElement = document.getElementById('loading');
const emptyStateElement = document.getElementById('empty-state');
const notificationElement = document.getElementById('notification');

// Funções utilitárias
function showNotification(message, isError = false) {
    if (notificationElement) {
        notificationElement.textContent = message;
        notificationElement.className = `notification ${isError ? 'error' : ''} show`;
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000);
    } else {
        // Fallback para alert se elemento não existir
        alert(message);
    }
}

function showLoading(show = true) {
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

function showEmptyState(show = true) {
    if (emptyStateElement) {
        emptyStateElement.style.display = show ? 'block' : 'none';
    }
}

// Carregar produtos do servidor (usando sua API real)
async function carregarProdutos() {
    try {
        showLoading(true);
        showEmptyState(false);
        
        // Sua chamada real à API
        const res = await fetch('/api/produtos');
        const data = await res.json();
        
        produtos = data;
        produtosFiltrados = [...produtos];
        window.produtos = produtos; // Manter compatibilidade com seu código
        mostrarProdutos();
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showNotification('Erro ao carregar produtos', true);
        
        // Se falhar, mostrar estado vazio
        produtos = [];
        produtosFiltrados = [];
        mostrarProdutos();
    } finally {
        showLoading(false);
    }
}

// Mostrar produtos na tela (versão melhorada do PASTED)
function mostrarProdutos() {
    produtosContainer.innerHTML = '';
    
    if (produtosFiltrados.length === 0) {
        showEmptyState(true);
        return;
    }
    
    showEmptyState(false);
    
    produtosFiltrados.forEach((produto, index) => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.role = 'listitem';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="product-header">
                <span class="product-id" aria-label="ID do produto">ID: ${produto.id}</span>
                <div class="product-actions">
                    <button 
                        class="btn-small btn-save" 
                        data-id="${produto.id}"
                        type="button"
                        aria-label="Salvar alterações do produto ${produto.id}"
                        title="Salvar alterações"
                    >
                        <i class="fas fa-save" aria-hidden="true"></i>
                    </button>
                    <button 
                        class="btn-small btn-remove" 
                        data-id="${produto.id}"
                        type="button"
                        aria-label="Remover produto ${produto.id}"
                        title="Remover produto"
                    >
                        <i class="fas fa-trash" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            
            <div class="input-group">
                <label class="input-label" for="nome-${produto.id}">Nome do Produto</label>
                <input 
                    type="text" 
                    id="nome-${produto.id}"
                    value="${produto.nome || ''}" 
                    data-field="nome" 
                    data-id="${produto.id}" 
                    class="form-input edit-input"
                    maxlength="100"
                    aria-label="Nome do produto ${produto.id}"
                />
            </div>
            
            <div class="input-group">
                <label class="input-label" for="descricao-${produto.id}">Descrição</label>
                <textarea 
                    id="descricao-${produto.id}"
                    data-field="descricao" 
                    data-id="${produto.id}" 
                    class="form-input form-textarea edit-input"
                    maxlength="500"
                    aria-label="Descrição do produto ${produto.id}"
                >${produto.descricao || ''}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="input-group">
                    <label class="input-label" for="type-${produto.id}">Tipo</label>
                    <input 
                        type="text" 
                        id="type-${produto.id}"
                        value="${produto.especificacoes?.type || ''}" 
                        data-field="type" 
                        data-id="${produto.id}" 
                        class="form-input edit-input"
                        maxlength="50"
                        aria-label="Tipo do produto ${produto.id}"
                    />
                </div>
                
                <div class="input-group">
                    <label class="input-label" for="size-${produto.id}">Tamanho</label>
                    <input 
                        type="text" 
                        id="size-${produto.id}"
                        value="${produto.especificacoes?.size || ''}" 
                        data-field="size" 
                        data-id="${produto.id}" 
                        class="form-input edit-input"
                        maxlength="50"
                        aria-label="Tamanho do produto ${produto.id}"
                    />
                </div>
                
                <div class="input-group">
                    <label class="input-label" for="thickness-${produto.id}">Espessura</label>
                    <input 
                        type="text" 
                        id="thickness-${produto.id}"
                        value="${produto.especificacoes?.thickness || ''}" 
                        data-field="thickness" 
                        data-id="${produto.id}" 
                        class="form-input edit-input"
                        maxlength="30"
                        aria-label="Espessura do produto ${produto.id}"
                    />
                </div>
                
                <div class="input-group">
                    <label class="input-label" for="gsm-${produto.id}">GSM</label>
                    <input 
                        type="text" 
                        id="gsm-${produto.id}"
                        value="${produto.especificacoes?.gsm || ''}" 
                        data-field="gsm" 
                        data-id="${produto.id}" 
                        class="form-input edit-input"
                        maxlength="30"
                        aria-label="GSM do produto ${produto.id}"
                    />
                </div>
            </div>
        `;
        
        produtosContainer.appendChild(card);
    });

    // Adicionar event listeners
    adicionarEventListeners();
}

// Adicionar event listeners para os botões e inputs
function adicionarEventListeners() {
    // Botões de salvar
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', salvarProduto);
    });

    // Botões de remover
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', removerProduto);
    });

    // Detectar mudanças nos campos para destacar
    document.querySelectorAll('.edit-input').forEach(input => {
        const originalValue = input.value;
        input.addEventListener('input', function() {
            if (this.value !== originalValue) {
                this.classList.add('changed');
            } else {
                this.classList.remove('changed');
            }
        });
    });
}

// Salvar produto (usando sua API real)
async function salvarProduto(e) {
    const id = parseInt(e.target.dataset.id);
    const inputs = document.querySelectorAll(`.edit-input[data-id="${id}"]`);
    const produtoAtualizado = { id, nome: '', descricao: '', especificacoes: {} };

    inputs.forEach(input => {
        const field = input.dataset.field;
        if (field === 'nome') {
            produtoAtualizado.nome = input.value;
        } else if (field === 'descricao') {
            produtoAtualizado.descricao = input.value;
        } else {
            produtoAtualizado.especificacoes[field] = input.value;
        }
    });

    try {
        e.target.disabled = true;
        e.target.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        await fetch(`/api/produtos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoAtualizado)
        });

        // Atualiza a lista local de produtos
        const index = produtos.findIndex(p => p.id === id);
        if (index !== -1) produtos[index] = produtoAtualizado;
        window.produtos = produtos;

        showNotification('Produto atualizado com sucesso!');
        carregarProdutos();
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        showNotification('Erro ao salvar produto', true);
    } finally {
        e.target.disabled = false;
        e.target.innerHTML = '<i class="fas fa-save"></i>';
    }
}


// Remover produto (usando sua API real)
async function removerProduto(e) {
    const id = parseInt(e.target.closest('.btn-remove').dataset.id);
    const produto = produtos.find(p => p.id === id);
    
    if (!confirm(`Tem certeza que deseja remover o produto "${produto?.nome || id}"?`)) {
        return;
    }

    try {
        // Desabilitar botão durante remoção
        e.target.disabled = true;
        e.target.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';

        // Sua chamada real à API
        await fetch(`/api/produtos/${id}`, { method: 'DELETE' });

        // Remover produto localmente
        produtos = produtos.filter(p => p.id !== id);
        produtosFiltrados = produtosFiltrados.filter(p => p.id !== id);
        window.produtos = produtos; // Atualizar referência global

        showNotification('Produto removido com sucesso!');
        mostrarProdutos();
        
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        showNotification('Erro ao remover produto', true);
    }
}

// Adicionar novo produto (usando sua API real)
if (formAdd) {
    formAdd.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const novoProduto = {
            id: parseInt(formData.get('id')),
            nome: formData.get('nome'),
            descricao: formData.get('descricao'),
            especificacoes: {
                type: formData.get('type'),
                size: formData.get('size'),
                thickness: formData.get('thickness'),
                gsm: formData.get('gsm')
            }
        };

        // Verificar se ID já existe
        if (produtos.some(p => p.id === novoProduto.id)) {
            showNotification('ID já existe! Use um ID diferente.', true);
            return;
        }

        try {
            // Desabilitar botão durante envio
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Adicionando...';
            }

            // Sua chamada real à API
            await fetch('/api/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoProduto)
            });

            // Adicionar produto localmente
            produtos.push(novoProduto);
            produtosFiltrados = [...produtos];
            window.produtos = produtos; // Atualizar referência global

            // Limpar formulário
            e.target.reset();
            
            // Esconder formulário se elementos existirem
            if (addProductSection && btnToggleForm) {
                addProductSection.style.display = 'none';
                btnToggleForm.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> Adicionar Produto';
                btnToggleForm.setAttribute('aria-label', 'Mostrar formulário de adicionar produto');
            }

            showNotification('Produto adicionado com sucesso!');
            mostrarProdutos();
            
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            showNotification('Erro ao adicionar produto', true);
        } finally {
            // Reabilitar botão
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i> Adicionar Produto';
            }
        }
    });
}

// Toggle formulário de adicionar
if (btnToggleForm && addProductSection) {
    btnToggleForm.addEventListener('click', () => {
        const isVisible = addProductSection.style.display !== 'none';
        
        if (isVisible) {
            addProductSection.style.display = 'none';
            btnToggleForm.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> Adicionar Produto';
            btnToggleForm.setAttribute('aria-label', 'Mostrar formulário de adicionar produto');
        } else {
            addProductSection.style.display = 'block';
            btnToggleForm.innerHTML = '<i class="fas fa-minus" aria-hidden="true"></i> Ocultar Formulário';
            btnToggleForm.setAttribute('aria-label', 'Ocultar formulário de adicionar produto');
            
            // Focar no primeiro campo
            const firstInput = document.getElementById('input-id');
            if (firstInput) firstInput.focus();
        }
    });
}


// Gerar PDF (usando sua API real)
// Gerar PDF (usando sua API real)
if (btnGerar) {
    btnGerar.addEventListener('click', async () => {
        try {
            // Desabilitar botão durante geração
            btnGerar.disabled = true;
            btnGerar.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Gerando PDF...';

            // Sua chamada real à API
            const res = await fetch('/api/gerar-pdf', { method: 'POST' });
            const json = await res.json();

            showNotification(json.message || 'PDF gerado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            showNotification('Erro ao gerar PDF', true);
        } finally {
            // Reabilitar botão
            btnGerar.disabled = false;
            btnGerar.innerHTML = '<i class="fas fa-file-pdf" aria-hidden="true"></i> Gerar PDF';
        }
    });
}

// Pesquisa (melhorada)
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase().trim();
        
        if (!termo) {
            produtosFiltrados = [...produtos];
        } else {
            produtosFiltrados = produtos.filter(produto =>
                String(produto.id).includes(termo) ||
                (produto.nome && produto.nome.toLowerCase().includes(termo)) ||
                (produto.descricao && produto.descricao.toLowerCase().includes(termo)) ||
                (produto.especificacoes?.type && produto.especificacoes.type.toLowerCase().includes(termo))
            );
        }
        
        mostrarProdutos();
    });
}

// Navegação por teclado no formulário
document.addEventListener('keydown', (e) => {
    // Esc para fechar formulário
    if (e.key === 'Escape' && addProductSection && addProductSection.style.display !== 'none') {
        if (btnToggleForm) btnToggleForm.click();
    }
    
    // Ctrl+F para focar na pesquisa
    if (e.ctrlKey && e.key === 'f' && searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Ctrl+N para adicionar produto
    if (e.ctrlKey && e.key === 'n' && addProductSection && btnToggleForm) {
        e.preventDefault();
        if (addProductSection.style.display === 'none') {
            btnToggleForm.click();
        }
    }
});

// Carregar produtos ao inicializar
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
});

// Inicializar aplicação
carregarProdutos();