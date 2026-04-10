# Comando inicial
Para iniciar o projeto, basta rodar o comando abaixo no terminal:

```bash
npx create-video@latest
```
Esse comando irá criar um novo projeto de vídeo usando o Remotion. Ele irá solicitar algumas informações, como o nome do projeto e a pasta onde ele deve ser criado. Após fornecer essas informações, o comando irá configurar o ambiente de desenvolvimento para você.

# Comando para instalar dependências
Antes de começar a desenvolver seu vídeo, é importante instalar as dependências necessárias para o projeto.
Para isso, use o seguinte comando:

```bash
npm i
```
Esse comando irá ler o arquivo `package.json` do seu projeto e instalar todas as dependências listadas nele. Isso inclui o próprio Remotion, bem como quaisquer bibliotecas adicionais que você possa estar usando em seu projeto. Certifique-se de rodar esse comando antes de iniciar o desenvolvimento para garantir que todas as dependências estejam corretamente instaladas.

# Comando para iniciar o servidor de desenvolvimento
Durante o desenvolvimento do seu vídeo, você pode iniciar um servidor de desenvolvimento para visualizar as mudanças em tempo real. Para isso, use o seguinte comando:

```bash
npm run dev
```
Esse comando irá iniciar o servidor de desenvolvimento e abrir uma janela do navegador onde você poderá ver o vídeo em desenvolvimento. À medida que você fizer alterações no código, o vídeo será atualizado automaticamente no navegador, permitindo que você veja as mudanças imediatamente.

# Comando para renderizar o vídeo
Depois de criar o projeto e desenvolver seu vídeo, você pode renderizá-lo usando o seguinte comando:

```bash
npx remotion render
```

Esse comando irá compilar o seu projeto e gerar o vídeo final. Ele pode levar algum tempo, dependendo da complexidade do seu vídeo e do poder de processamento do seu computador. Após a renderização, o vídeo estará disponível na pasta de saída especificada no seu projeto.

# Comando para atualizar o Remotion
Para manter o Remotion atualizado com as últimas melhorias e correções de bugs, você pode usar o seguinte comando:

```bash
npx remotion upgrade
```
Esse comando irá verificar se há uma nova versão do Remotion disponível e, se houver, ele irá atualizar o pacote para a versão mais recente. Manter o Remotion atualizado é importante para garantir que você tenha acesso às últimas funcionalidades e melhorias de desempenho.

# Comando para usar o Claude Code
O Remotion também suporta o uso do Claude Code, uma linguagem de programação visual que facilita a criação de vídeos. Para usar o Claude Code, você pode seguir as instruções na documentação oficial do Remotion, onde encontrará exemplos e guias para começar a usar essa funcionalidade. O Claude Code permite que você crie vídeos de forma mais intuitiva, usando blocos visuais em vez de escrever código manualmente.

```bash
claude
```
Esse comando irá iniciar o ambiente de desenvolvimento do Claude Code, onde você poderá criar e editar seus vídeos usando a interface visual. O Claude Code é uma ótima opção para aqueles que preferem uma abordagem mais visual para a criação de vídeos, e o Remotion oferece suporte completo para essa funcionalidade.