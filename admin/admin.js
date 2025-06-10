document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tab-button');
  const actionSelect = document.getElementById('actionSelect');
  const formTitle = document.getElementById('formTitle');
  const dataForm = document.getElementById('dataForm');
  const cancelBtn = document.getElementById('cancelBtn');
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  const inputId = document.getElementById('dataId');
  const field1 = document.getElementById('field1');
  const field2 = document.getElementById('field2');
  const field3 = document.getElementById('field3');

  const label1 = document.getElementById('label1');
  const label2 = document.getElementById('label2');
  const label3 = document.getElementById('label3');
  const group2 = document.getElementById('group2');
  const group3 = document.getElementById('group3');

  let currentType = 'produtos';
  let currentAction = 'add';
  let cache = [];

  function updateFormFields() {
    const map = {
      produtos: {
        label1: 'Nome',
        label2: 'Preço',
        label3: 'Imagem (URL)',
        placeholder1: 'Nome do produto',
        placeholder2: 'Preço do produto (ex: 9.90)',
        placeholder3: 'URL da imagem',
        visible: [true, true] // group2 e group3 visíveis
      },
      cupons: {
        label1: 'Código',
        label2: 'Desconto (%)',
        label3: '',
        placeholder1: 'Código do cupom',
        placeholder2: 'Valor do desconto (ex: 10)',
        placeholder3: '',
        visible: [true, false] // só group2 visível, group3 oculto
      },
      cadastros: {
        label1: 'Usuário',
        label2: 'Senha',
        label3: 'Email',
        placeholder1: 'Nome de usuário',
        placeholder2: 'Senha',
        placeholder3: 'E-mail',
        visible: [true, true] // group2 e group3 visíveis
      }
    };

    const conf = map[currentType];
    label1.textContent = conf.label1;
    label2.textContent = conf.label2;
    label3.textContent = conf.label3;

    field1.placeholder = conf.placeholder1;
    field2.placeholder = conf.placeholder2;
    field3.placeholder = conf.placeholder3;

    group2.style.display = conf.visible[0] ? 'block' : 'none';
    group3.style.display = conf.visible[1] ? 'block' : 'none';

    // Atualizar título do form para refletir ação e tipo
    formTitle.textContent = {
      add: 'Adicionar',
      edit: 'Editar',
      delete: 'Excluir'
    }[currentAction] + ' ' + currentType.slice(0, -1).toUpperCase();
  }

  function resetForm() {
    dataForm.reset();
    inputId.value = '';
    [field1, field2, field3].forEach(f => f.removeAttribute('disabled'));
  }

  function setFormValues(item) {
    inputId.value = item.id || item.code || item.username || '';
    // Para o primeiro campo, dependendo do tipo:
    field1.value = item.name || item.code || item.username || '';
    // Para o segundo campo, converter números para string para exibir:
    if (currentType === 'produtos') {
      field2.value = item.price != null ? item.price.toString() : '';
    } else if (currentType === 'cupons') {
      field2.value = item.discount != null ? item.discount.toString() : '';
    } else if (currentType === 'cadastros') {
      field2.value = item.password || '';
    }
    // Terceiro campo:
    field3.value = item.image || item.email || '';

    if (currentAction === 'delete') {
      [field1, field2, field3].forEach(f => f.setAttribute('disabled', ''));
    } else {
      [field1, field2, field3].forEach(f => f.removeAttribute('disabled'));
    }
  }

  function fetchData() {
    fetch(`http://localhost:3000/${currentType}`)
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar dados');
        return res.json();
      })
      .then(data => {
        cache = data;
      })
      .catch(err => {
        console.error('Erro ao carregar dados:', err);
        alert('Erro ao carregar dados do servidor.');
      });
  }

  function handleSearch() {
    const term = searchInput.value.trim().toLowerCase();
    if (!term) return alert('Digite algo para pesquisar!');

    const item = cache.find(obj =>
      (obj.name || obj.code || obj.username || '').toLowerCase() === term
    );

    if (item) {
      setFormValues(item);
    } else {
      alert(`${currentType.slice(0, -1)} não encontrado!`);
      resetForm();
    }
  }

  searchBtn.addEventListener('click', handleSearch);

  actionSelect.addEventListener('change', () => {
    currentAction = actionSelect.value;
    updateFormFields();
    resetForm();
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentType = tab.dataset.tab;
      updateFormFields();
      fetchData();
      resetForm();
    });
  });

  cancelBtn.addEventListener('click', resetForm);

  dataForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = inputId.value;
    let body = {};

    if (currentType === 'produtos') {
      // Validar preço numérico
      const price = parseFloat(field2.value.replace(',', '.'));
      if (isNaN(price)) return alert('Preço inválido!');
      body = { name: field1.value.trim(), price: price, image: field3.value.trim() };
    } else if (currentType === 'cupons') {
      const discount = parseInt(field2.value, 10);
      if (isNaN(discount)) return alert('Desconto inválido!');
      body = { code: field1.value.trim(), discount: discount };
    } else if (currentType === 'cadastros') {
      body = { username: field1.value.trim(), password: field2.value, email: field3.value.trim() };
    }

    let url = `http://localhost:3000/${currentType}`;
    let opts = { headers: { 'Content-Type': 'application/json' } };

    if (currentAction === 'add') {
      opts.method = 'POST';
      opts.body = JSON.stringify(body);
    } else if (currentAction === 'edit') {
      if (!id) return alert('Nenhum item selecionado para editar!');
      opts.method = 'PUT';
      opts.body = JSON.stringify(body);
      url += `/${id}`;
    } else if (currentAction === 'delete') {
      if (!id) return alert('Nenhum item selecionado para excluir!');
      opts.method = 'DELETE';
      url += `/${id}`;
    }

    fetch(url, opts)
      .then(res => res.ok ? res.json() : res.json().then(j => Promise.reject(j)))
      .then(() => {
        alert(`${currentType.slice(0, -1)} ${currentAction} com sucesso!`);
        fetchData();
        resetForm();
      })
      .catch(err => alert(err.message || 'Erro ao processar ação.'));
  });

  // Inicialização
  updateFormFields();
  fetchData();
});
