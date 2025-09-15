# ⚽ Sorteador de Pelada

Um site desenvolvido em **HTML, CSS e JavaScript** para organizar peladas de futebol com sorteio dinâmico de times.  
Com interface temática esportiva e funcionalidades flexíveis, o sistema ajuda a equilibrar as equipes de forma simples e divertida.

---

## 🚀 Funcionalidades

- 🎲 **Modo Manual**  
  - Inserção de jogadores de linha e goleiros manualmente.  
  - Sorteio de jogadores para times definidos.  
  - Garante que cada time tenha 1 goleiro.  

- 🚫 **Restrições de jogadores**  
  - Adicione grupos de jogadores que **não podem ficar no mesmo time** para equilibrar as equipes.  

- 📝 **Colar nomes**  
  - Cole nomes separados por vírgulas ou quebras de linha.  
  - Sorteio rápido de jogadores para times sem restrições.  

- 🔢 **Sorteio por números**  
  - Cada jogador sorteia um número único.  
  - Intervalos de números definem a qual time o jogador pertence.  

- 💾 **LocalStorage**  
  - Lista de jogadores armazenada no navegador para reutilização futura.  

- 📤 **Exportação de resultados**  
  - Copie os times gerados em formato JSON para a área de transferência.  

- 🎨 **Tema esportivo**  
  - Layout verde/dourado responsivo e estilizado para futebol.  

---

## 📂 Estrutura do Projeto

/sorteador-pelada
├── index.html # Estrutura do site
├── style.css # Estilos visuais
├── script.js # Lógica de sorteio e interações
└── assets/ # (opcional) imagens, ícones e recursos


---

## 🛠️ Tecnologias Utilizadas

- **HTML5** → estrutura da aplicação  
- **CSS3** → design, cores, layout e responsividade  
- **JavaScript (ES6+)** → lógica de sorteio e regras do sistema  
- **LocalStorage** → persistência de jogadores no navegador  

---

## 📖 Como Usar

1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/sorteador-pelada.git
   
Abra o arquivo index.html diretamente no navegador.

Escolha uma das três formas de sorteio:

Manual → insira jogadores e goleiros, defina restrições e sorteie.

Colar nomes → cole os nomes e sorteie automaticamente.

Sorteio por números → cada jogador clica para pegar um número único.

Visualize os times formados em tela e exporte se necessário.

🔮 Melhorias Futuras

📊 Balanceamento automático por habilidade dos jogadores.

🖼️ Exportação dos resultados em imagem.

🔄 Reembaralhar mantendo goleiros fixos.

📱 Transformar em PWA para uso offline no celular.

👨‍💻 Autor

Desenvolvido por Hiago Souza
.
Se gostou do projeto, ⭐ dê uma estrela no repositório!
