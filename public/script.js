import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'SUA_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'SUA_SUPABASE_ANON_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



// ==========================
// Variáveis globais
// ==========================
const btnTips = document.querySelector('.show-usage-tips');
const usageTips = document.querySelector('.usage-tips');
let produtos = [];
let produtosFiltrados = [];

const produtosContainer = document.getElementById('produtos-container');
const searchInput = document.getElementById('search');
const formAdd = document.getElementById('form-add');
const btnGerar = document.getElementById('btn-gerar');
const btnToggleForm = document.getElementById('btn-toggle-form');
const addProductSection = document.getElementById('add-product-section');
const loadingElement = document.getElementById('loading');
const emptyStateElement = document.getElementById('empty-state');
const notificationElement = document.getElementById('notification');

// ==========================
// Funções utilitárias
// ==========================
function showNotification(message, isError = false) {
    if (notificationElement) {
        notificationElement.textContent = message;
        notificationElement.className = `notification ${isError ? 'error' : ''} show`;
        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000);
    } else {
        alert(message);
    }
}

function showLoading(show = true) {
    if (loadingElement) loadingElement.style.display = show ? 'block' : 'none';
}

function showEmptyState(show = true) {
    if (emptyStateElement) emptyStateElement.style.display = show ? 'block' : 'none';
}

// ==========================
// Mostrar/Ocultar dicas
// ==========================
if (btnTips && usageTips) {
    btnTips.addEventListener('mouseenter', () => usageTips.classList.add('active'));
    usageTips.addEventListener('mouseleave', () => usageTips.classList.remove('active'));
}

// ==========================
// Carregar produtos
// ==========================
async function carregarProdutos() {
    try {
        showLoading(true);
        showEmptyState(false);

        const { data, error } = await supabase.from('produtos').select('*');
        if (error) throw error;

        produtos = data;
        produtosFiltrados = [...produtos];
        mostrarProdutos();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showNotification('Erro ao carregar produtos', true);
        produtos = [];
        produtosFiltrados = [];
        mostrarProdutos();
    } finally {
        showLoading(false);
    }
}


// ==========================
// Mostrar produtos na tela
// ==========================
document.getElementById('btn-gerar').addEventListener('click', () => {
  window.open('/api/gerar-pdf', '_blank');
});

carregarProdutos();
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

    // Adicionar listeners após renderizar
    adicionarEventListeners();
}

// ==========================
// Event listeners de cards
// ==========================
function adicionarEventListeners() {
    // Salvar produto
    document.querySelectorAll('.btn-save').forEach(btn => {
        btn.addEventListener('click', salvarProduto);
    });

    // Remover produto
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', removerProduto);
    });

    // Detectar mudanças nos inputs
    document.querySelectorAll('.edit-input').forEach(input => {
        const originalValue = input.value;
        input.addEventListener('input', function() {
            if (this.value !== originalValue) this.classList.add('changed');
            else this.classList.remove('changed');
        });
    });
}

// ==========================
// Salvar produto
// ==========================
async function salvarProduto(e) {
    const btn = e.target.closest('.btn-save');
    const id = parseInt(btn.dataset.id);
    const inputs = document.querySelectorAll(`.edit-input[data-id="${id}"]`);
    const produtoAtualizado = { id, nome: '', descricao: '', especificacoes: {} };

    inputs.forEach(input => {
        const field = input.dataset.field;
        if (field === 'nome') produtoAtualizado.nome = input.value;
        else if (field === 'descricao') produtoAtualizado.descricao = input.value;
        else produtoAtualizado.especificacoes[field] = input.value;
    });

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        const { data, error } = await supabase
            .from('produtos')
            .update({
                nome: produtoAtualizado.nome,
                descricao: produtoAtualizado.descricao,
                especificacoes: produtoAtualizado.especificacoes
            })
            .eq('id', id);

        if (error) throw error;

        const index = produtos.findIndex(p => p.id === id);
        if (index !== -1) produtos[index] = { ...produtos[index], ...produtoAtualizado };
        inputs.forEach(input => input.classList.remove('changed'));

        showNotification('Produto atualizado com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        showNotification('Erro ao salvar produto', true);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i>';
    }
}


// ==========================
// Remover produto
// ==========================
async function removerProduto(e) {
    const btn = e.target.closest('.btn-remove');
    const id = parseInt(btn.dataset.id);
    const produto = produtos.find(p => p.id === id);

    if (!confirm(`Tem certeza que deseja remover o produto "${produto?.nome || id}"?`)) return;

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        const { error } = await supabase.from('produtos').delete().eq('id', id);
        if (error) throw error;

        produtos = produtos.filter(p => p.id !== id);
        produtosFiltrados = produtosFiltrados.filter(p => p.id !== id);
        mostrarProdutos();

        showNotification('Produto removido com sucesso!');
    } catch (error) {
        console.error('Erro ao remover produto:', error);
        showNotification('Erro ao remover produto', true);
    }
}


// ==========================
// Adicionar produto
// ==========================
if (formAdd) {
    formAdd.addEventListener('submit', async e => {
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

        if (produtos.some(p => p.id === novoProduto.id)) {
            showNotification('ID já existe! Use um ID diferente.', true);
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adicionando...';

            await fetch('/api/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoProduto)
            });

            produtos.push(novoProduto);
            produtosFiltrados = [...produtos];
            mostrarProdutos();

            e.target.reset();

            if (addProductSection && btnToggleForm) {
                addProductSection.style.display = 'none';
                btnToggleForm.innerHTML = '<i class="fas fa-plus"></i> Adicionar Produto';
            }

            showNotification('Produto adicionado com sucesso!');
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            showNotification('Erro ao adicionar produto', true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Adicionar Produto';
        }
    });
}

// ==========================
// Toggle formulário adicionar
// ==========================
if (btnToggleForm && addProductSection) {
    btnToggleForm.addEventListener('click', () => {
        const isVisible = addProductSection.style.display !== 'none';
        addProductSection.style.display = isVisible ? 'none' : 'block';
        btnToggleForm.innerHTML = isVisible ? 
            '<i class="fas fa-plus"></i> Adicionar Produto' : 
            '<i class="fas fa-minus"></i> Ocultar Formulário';

        if (!isVisible) {
            const firstInput = document.getElementById('input-id');
            if (firstInput) firstInput.focus();
        }
    });
}

// ==========================
// Gerar PDF
// ==========================



// ==========================
// Pesquisa
// ==========================
if (searchInput) {
    searchInput.addEventListener('input', e => {
        const termo = e.target.value.toLowerCase().trim();
        produtosFiltrados = !termo ? 
            [...produtos] : 
            produtos.filter(p =>
                String(p.id).includes(termo) ||
                (p.nome && p.nome.toLowerCase().includes(termo)) ||
                (p.descricao && p.descricao.toLowerCase().includes(termo)) ||
                (p.especificacoes?.type && p.especificacoes.type.toLowerCase().includes(termo))
            );
        mostrarProdutos();
    });
}

// ==========================
// Atalhos de teclado
// ==========================
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && addProductSection && addProductSection.style.display !== 'none') {
        if (btnToggleForm) btnToggleForm.click();
    }
    if (e.ctrlKey && e.key === 'f' && searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
    if (e.ctrlKey && e.key === 'n' && addProductSection && btnToggleForm) {
        e.preventDefault();
        if (addProductSection.style.display === 'none') btnToggleForm.click();
    }
});

// ==========================
// Inicialização
// ==========================
document.addEventListener('DOMContentLoaded', () => carregarProdutos());

