# Docker

## Prerequisites

- Node.js
- Docker

## pull, Build & Run

To pull the image run -

```bash
docker pull aquibsyed/todo-app:latest
```

You can verify if the image has been downloaded by using -

```bash
docker image ls

# preview
REPOSITORY            TAG       IMAGE ID       CREATED          SIZE
aquibsyed/todo-app    latest    1543656c9290   2 minutes ago    1.12GB
...
```

Then run the image using -

```bash
docker run aquibsyed/todo-app
```

If you are facing some sort of snapshots error, you can update the snapshots first then run the test -

```bash
docker run -e UPDATE_SNAPSHOTS=true aquibsyed/todo-app
```

## Git clone & docker run

```bash
# Clone the repository
git clone https://github.com/hadetan/playwright-test-todo-app.git

# Navigate to the project directory
cd yourproject
```

After cloning the repository, build the image and then run -

```bash
docker compose build
```

```bash
docker compose up
```

### Update snapshots (optional)

If you are facing snapshots error then run the image from docker with the environment `UPDATE_SNAPSHOT=true`.

- *Use this if only you are facing any snapshot errors, this will run two tests, first to update the snapshots and the second to test the project.*

***Note: In this method, the reports and the snapshots & screenshots will be saved inside of volumes***
