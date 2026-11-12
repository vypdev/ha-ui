#!/usr/bin/env bash
set -euo pipefail

# Do not mount the runner's Docker client configuration into the build.
docker_host=$(docker context inspect --format '{{.Endpoints.docker.Host}}')
docker_config=$(mktemp -d "${RUNNER_TEMP:?}/ha-ui-docker.XXXXXX")
container="ha-ui-pages-${GITHUB_RUN_ID:?}-${GITHUB_RUN_ATTEMPT:?}"
export DOCKER_HOST="$docker_host" DOCKER_CONFIG="$docker_config"
unset DOCKER_CONTEXT

cleanup() {
  docker rm --force "$container" >/dev/null 2>&1 || true
  rm -rf -- "$docker_config"
}
trap cleanup EXIT

docker run --rm --init --interactive --name "$container" --platform linux/arm64 \
  --shm-size 1g \
  --mount "type=bind,source=$(pwd -P),target=/workspace" \
  --workdir /workspace \
  --env CI=1 --env STORYBOOK_DISABLE_TELEMETRY=1 \
  --env npm_config_store_dir=/tmp/ha-ui-pnpm-store \
  "${HA_UI_PLAYWRIGHT_IMAGE:?}" bash -euo pipefail <<'LINUX'
HA_UI_NODE_VERSION=$(tr -d '\r\n' < .node-version)
package_manager=$(node --print 'require("./package.json").packageManager')
HA_UI_PNPM_VERSION=${package_manager#pnpm@}
export HA_UI_NODE_VERSION HA_UI_PNPM_VERSION

npm exec --yes --package="node@$HA_UI_NODE_VERSION" --package="$package_manager" -c '
  set -eu
  test "$(node --version)" = "v$HA_UI_NODE_VERSION"
  test "$(pnpm --version)" = "$HA_UI_PNPM_VERSION"
  pnpm install --frozen-lockfile --ignore-scripts
  pnpm check
  pnpm test
  GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=/workspace pnpm test:package
  pnpm test:ssr
  pnpm storybook:build
  pnpm test:engines
  pnpm test:storybook
'
LINUX
