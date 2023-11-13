<p align="center">
  <img src="https://github.com/Dyoniso/tiktok-breakout-game/assets/57969605/731b4018-db88-46a8-a08d-2322352f6d14" alt="tiktok-breakout-game"/>
</p>

Olá, este é um pequeno protótipo de jogo utilizando as funcionalidades da live do TikTok. O projeto foi inspirado no classico jogo Breakout lançado pela Atari em 1976. Onde
o objetivo principal e quebrar o maior número possível de tijolos com sua bola.

# ⭐ Como Jogar?

Nesse jogo, a dependerá da sua participação durante a transmissão ao vivo. Você terá duas opções: Pode mandar Mensagem no Chat ou fazer uma Doação.

Quando você manda mensagem, é como se deixasse um tijolinho com sua foto na parede do jogo. Bem legal, né? Tipo, você literalmente deixa sua marca no universo do jogo!

Agora, se você resolver fazer uma doação, a coisa fica ainda mais emocionante. Aparece uma bola no jogo e ela vai crescendo a cada vez que você manda um combo de doações. Quanto maior a bola, mais chances de detonar os tijolos com fotos de outros jogadores e as bolas menores. É tipo você dominando a arena de um jeito épico!

Imagina só a sua bola gigante arrasando tudo, enquanto os outros jogadores tentam competir. É tipo uma batalha virtual pela glória na arena.

[![preview1](https://github.com/Dyoniso/tiktok-breakout-game/assets/57969605/c02addc8-c4be-46df-b665-af42214b8164)](https://www.youtube.com/watch?v=gGOJv0wv5vA)

# ⭐ Como isso é possível?

De maneira simples, temos um conjunto de códigos que formam uma API (conjunto de instruções para interagir com outros programas). Essa API foi escrita em Node.js e tem a capacidade de se conectar aos serviços de transmissões ao vivo do TikTok.

Para essa conexão acontecer, é necessário informar o nome do usuário que está realizando a transmissão ao vivo. Depois de estabelecer a conexão, a API começa a monitorar as atividades da transmissão ao vivo, como interações no chat, doações e outras ações. Todas essas ações identificadas pela API são transformadas em objetos do tipo "Game" e são enviadas para o cliente. O cliente é a parte que interpreta esses dados e os exibe em um "Canvas" (uma espécie de tela ou área visual).

Resumindo, a API facilita a comunicação entre os serviços do TikTok e transforma os dados em um jogo competitivo e divertido.

# ⭐ Como Configurar?

A configuração é bem simples basta clonar este repositório:
```
git clone https://github.com/Dyoniso/tiktok-breakout-game
```

Com o repositório clonado, entre na pasta e instale os módulos do Node
```
npm install .
```

Com a instalação concluída. Revise o Arquivo de Configuração do Projeto ```.env``` :
```
# Server
HOST=localhost # Host Padrão do Servidor
PORT=8080 # Porta Padrão do Servidor

# Game
LIVE_NAME = 'USER_LIVE' # Nome do Usário que está executando a live.
LIVE_MIN_LIKE = 20 # O mínimo de Like para adicionar um nova bola no cenário.
WALL_BACKGROUND = 'blue' # Background padrão do cênario.
WALL_SIZE = 32 # Tamanho em pixel dos tijolo da parede.
WALL_ROW = 8 # Quantidade máxima de linhas que os tijolos irá aparecer.
WALL_COL = 10 # Coluna máxima que os tijolos irá aparecer.
BALL_SIZE = 30 # Tamanho em pixel da bola.
BALL_SPEED = 2 # Velocidade padrão da bola ao aparecer.
BALL_MAX_SPEED = 8 # Velocidade Máxima da bola.
BALL_MAX_SIZE = 120 # Tamanho máximo que a bola pode chegar por doação.
BALL_MIN_SIZE = 25 # Tamanho padrão da bola ao aparecer.
```

Perfeito, execute um ```node app.js``` e abra o Projeto no seu navegador!

![ts6F18NYDxX1JnbKaa](https://github.com/Dyoniso/tiktok-breakout-game/assets/57969605/b295cdd0-df0a-4874-9684-4fb4bc1c0fe2)

<p align="center">
  🤖 🔥 ⚙️
</p>
