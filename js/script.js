function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function salvarKey() {
  const key = val('apikey');
  if (!key) return;
  localStorage.setItem('groq_key', key);
  document.getElementById('key-status').textContent = '✓ Chave salva';
  setTimeout(() => document.getElementById('key-status').textContent = '', 2000);
}

(function carregarKey() {
  const key = localStorage.getItem('groq_key');
  if (key) {
    document.getElementById('apikey').value = key;
    document.getElementById('key-status').textContent = '✓ Chave salva';
  }
})();

function coletarDados() {
  return {
    keyword:  val('keyword'),
    preco:    val('preco'),
    precoOri: val('preco_original'),
    categoria:val('categoria'),
    condicao: val('condicao'),
    cores:    val('cores'),
    tamanhos: val('tamanhos'),
    peso:     val('peso'),
    prazo:    val('prazo'),
    pontos:   val('pontos'),
  };
}

function gerar() {
  const d = coletarDados();
  const nome = d.keyword;
  if (!nome) { alert('Digite a palavra-chave do produto.'); return; }
  const titulo = gerarTitulo(nome, d.cores, d.tamanhos, d.condicao);
  const anuncio = montarAnuncio(d, titulo, gerarDescricao(d));
  exibirAnuncio(nome, anuncio);
}

function gerarTitulo(nome, cores, tamanhos, condicao) {
  let titulo = nome;
  if (cores) titulo += ` - ${cores.split(',')[0].trim()}`;
  if (tamanhos) titulo += ` | Tam: ${tamanhos.split(',').slice(0, 3).join('/')}`;
  if (condicao && condicao !== 'Novo') titulo += ` | ${condicao}`;
  return titulo.substring(0, 120);
}

function gerarDescricao(d) {
  const nome = d.keyword;
  let desc = `📦 ${nome.toUpperCase()}\n`;
  desc += `${'─'.repeat(40)}\n\n`;
  if (d.pontos) {
    desc += `✅ CARACTERÍSTICAS:\n`;
    d.pontos.split('\n').filter(p => p.trim()).forEach(p => desc += `• ${p.trim()}\n`);
    desc += '\n';
  }
  if (d.cores)    desc += `🎨 CORES DISPONÍVEIS: ${d.cores}\n`;
  if (d.tamanhos) desc += `📏 TAMANHOS DISPONÍVEIS: ${d.tamanhos}\n`;
  if (d.preco) {
    desc += `\n💰 PREÇO: R$ ${parseFloat(d.preco).toFixed(2).replace('.', ',')}`;
    if (d.precoOri) desc += ` (De R$ ${parseFloat(d.precoOri).toFixed(2).replace('.', ',')})`;
    desc += '\n';
  }
  if (d.condicao) desc += `📦 CONDIÇÃO: ${d.condicao}\n`;
  desc += `🚚 ENVIO EM ATÉ ${d.prazo || 2} DIA(S) ÚTIL(EIS)\n`;
  if (d.peso) desc += `⚖️ PESO: ${d.peso} kg\n`;
  desc += `\n${'─'.repeat(40)}\n`;
  desc += `🏪 Compre com segurança pela Shopee!\n`;
  desc += `⭐ Avalie nossa loja após receber seu pedido.\n`;
  return desc;
}

function montarAnuncio(d, titulo, descricao) {
  let anuncio = `🏷️ TÍTULO:\n${titulo}\n\n`;
  if (d.categoria) anuncio += `📂 CATEGORIA: ${d.categoria}\n\n`;
  anuncio += `📝 DESCRIÇÃO:\n${descricao}`;
  return anuncio;
}

function exibirAnuncio(nome, anuncio) {
  document.getElementById('preview').textContent = anuncio;
  document.getElementById('resultado').classList.remove('hidden');
  salvar(nome, anuncio);
}

async function gerarComIA() {
  const d = coletarDados();
  if (!d.keyword) { alert('Digite a palavra-chave do produto.'); return; }

  const key = localStorage.getItem('groq_key');
  if (!key) { alert('Cole sua Groq API Key na barra lateral e clique em Salvar.'); return; }

  const loading = document.getElementById('ia-loading');
  const btnIA = document.querySelector('.btn-ia');
  loading.classList.remove('hidden');
  btnIA.disabled = true;

  const extras = [
    d.preco     ? `- Preço: R$ ${d.preco}${d.precoOri ? ` (De R$ ${d.precoOri})` : ''}` : '',
    d.categoria ? `- Categoria: ${d.categoria}` : '',
    d.condicao  ? `- Condição: ${d.condicao}` : '',
    d.cores     ? `- Cores disponíveis: ${d.cores}` : '',
    d.tamanhos  ? `- Tamanhos disponíveis: ${d.tamanhos}` : '',
    d.peso      ? `- Peso: ${d.peso} kg` : '',
    d.prazo     ? `- Prazo de envio: ${d.prazo} dia(s)` : '',
    d.pontos    ? `- Diferenciais: ${d.pontos.replace(/\n/g, ', ')}` : '',
  ].filter(Boolean).join('\n');

  const prompt = `Você é um especialista em e-commerce com profundo conhecimento dos melhores anúncios da Shopee Brasil. Você já analisou centenas de anúncios de alto desempenho e sabe exatamente o que faz um anúncio converter mais.

Produto: "${d.keyword}"
${extras ? `\nInformações adicionais:\n${extras}` : ''}

Sua tarefa é criar o anúncio perfeito para a Shopee Brasil, como se tivesse analisado os top 10 anúncios mais vendidos desse produto na plataforma.

Siga estas diretrizes dos melhores vendedores da Shopee:

TÍTULO (máx 120 caracteres):
- Comece com a palavra-chave principal
- Inclua os principais atributos (material, cor, tamanho, uso)
- Use termos de busca que compradores reais usam
- Seja específico e direto

DESCRIÇÃO (elaborada e persuasiva):
- Abra com uma frase de impacto que conecta com o problema do cliente
- Use emojis estrategicamente para organizar e chamar atenção
- Destaque os 5 principais benefícios (não características, mas benefícios reais)
- Inclua seção de especificações técnicas
- Adicione gatilhos de urgência e prova social
- Mencione garantia, envio rápido e compra segura
- Finalize com chamada para ação
- Mínimo 300 palavras

TAGS (10 tags):
- Mix de termos genéricos e específicos
- Inclua variações de como as pessoas pesquisam esse produto
- Use termos populares de busca da Shopee

Responda APENAS em JSON puro (sem markdown):
{"titulo":"...","descricao":"...","tags":"tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10"}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Erro na API');

    let texto = json.choices[0].message.content.trim();
    texto = texto.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim();
    const dados = JSON.parse(texto);

    const tagsFormatadas = dados.tags
      ? dados.tags.split(',').slice(0, 10).map(t => `#${t.trim().replace(/\s+/g, '')}`).join(' ')
      : '';

    let anuncio = `🏷️ TÍTULO (IA):\n${dados.titulo}\n\n`;
    if (d.categoria) anuncio += `📂 CATEGORIA: ${d.categoria}\n\n`;
    anuncio += `📝 DESCRIÇÃO (IA):\n${dados.descricao}\n`;
    if (tagsFormatadas) anuncio += `\n🔖 TAGS (IA):\n${tagsFormatadas}`;

    exibirAnuncio(d.keyword, anuncio);
  } catch (e) {
    alert('Erro ao chamar a IA: ' + e.message);
  } finally {
    loading.classList.add('hidden');
    btnIA.disabled = false;
  }
}

function copiar() {
  const texto = document.getElementById('preview').textContent;
  navigator.clipboard.writeText(texto).then(() => {
    const btn = document.querySelector('.btn-copiar');
    btn.textContent = 'Copiado!';
    setTimeout(() => btn.textContent = 'Copiar Tudo', 2000);
  });
}

function salvar(nome, anuncio) {
  const salvos = JSON.parse(localStorage.getItem('anuncios') || '[]');
  salvos.unshift({ id: Date.now(), nome, anuncio, data: new Date().toLocaleDateString('pt-BR') });
  localStorage.setItem('anuncios', JSON.stringify(salvos.slice(0, 20)));
  renderSalvos();
}

function renderSalvos() {
  const salvos = JSON.parse(localStorage.getItem('anuncios') || '[]');
  const lista = document.getElementById('lista-salvos');
  const section = document.getElementById('salvos');
  if (salvos.length === 0) { section.classList.add('hidden'); return; }
  section.classList.remove('hidden');
  lista.innerHTML = salvos.map(s => `
    <div class="salvo-item">
      <div>
        <div class="salvo-nome">${s.nome}</div>
        <div class="salvo-data">${s.data}</div>
      </div>
      <div class="salvo-acoes">
        <button class="btn-ver" onclick="verSalvo(${s.id})">Ver</button>
        <button class="btn-del" onclick="deletarSalvo(${s.id})">Excluir</button>
      </div>
    </div>
  `).join('');
}

function verSalvo(id) {
  const salvos = JSON.parse(localStorage.getItem('anuncios') || '[]');
  const s = salvos.find(x => x.id === id);
  if (!s) return;
  document.getElementById('preview').textContent = s.anuncio;
  document.getElementById('resultado').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deletarSalvo(id) {
  const salvos = JSON.parse(localStorage.getItem('anuncios') || '[]');
  localStorage.setItem('anuncios', JSON.stringify(salvos.filter(x => x.id !== id)));
  renderSalvos();
}

renderSalvos();
