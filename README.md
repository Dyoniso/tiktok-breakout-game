# Breakout Game with TikTok Live

Olá, este é um pequeno protótipo de jogo utilizando as funcionalidades da live do TikTok. O projeto foi inspirado no classico jogo Breakout lançado pela Atari em 1976. Onde
o objetivo principal e quebrar o maior número possível de tijolos com sua bola.

# Como Jogar?

Nesse jogo, a dependerá da sua participação durante a transmissão ao vivo. Você terá duas opções: Pode mandar Mensagem no Chat ou fazer uma Doação.

Quando você manda mensagem, é como se deixasse um tijolinho com sua foto na parede do jogo. Bem legal, né? Tipo, você literalmente deixa sua marca no universo do jogo!

Agora, se você resolver fazer uma doação, a coisa fica ainda mais emocionante. Aparece uma bola no jogo e ela vai crescendo a cada vez que você manda um combo de doações. Quanto maior a bola, mais chances de detonar os tijolos com fotos de outros jogadores e as bolas menores. É tipo você dominando a arena de um jeito épico!

Imagina só a sua bola gigante arrasando tudo, enquanto os outros jogadores tentam competir. É tipo uma batalha virtual pela glória na arena.

# Como isso é possível?

De maneira simples, temos um conjunto de códigos que formam uma API (conjunto de instruções para interagir com outros programas). Essa API foi escrita em Node.js e tem a capacidade de se conectar aos serviços de transmissões ao vivo do TikTok.

Para essa conexão acontecer, é necessário informar o nome do usuário que está realizando a transmissão ao vivo. Depois de estabelecer a conexão, a API começa a monitorar as atividades da transmissão ao vivo, como interações no chat, doações e outras ações. Todas essas ações identificadas pela API são transformadas em objetos do tipo "Game" e são enviadas para o cliente. O cliente é a parte que interpreta esses dados e os exibe em um "Canvas" (uma espécie de tela ou área visual).

Resumindo, a API facilita a comunicação entre os serviços do TikTok e o que é exibido na tela durante a transmissão ao vivo.

# Como Configurar?

A configuração é bem simples basta clonar este repositório:
```
git clone https://github.com/Dyoniso/tiktok-breakout-game
```

