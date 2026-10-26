#!/bin/sh

cd /workspaces/build
rm -fR emsdk
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
cd ..

# Rust, for cores written in Rust (snow). The version must match the core's rust-toolchain.toml.
if ! command -v rustup >/dev/null 2>&1; then
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain none
fi
. "$HOME/.cargo/env"
rustup toolchain install 1.95.0 --profile minimal --component rust-src --target wasm32-unknown-emscripten
