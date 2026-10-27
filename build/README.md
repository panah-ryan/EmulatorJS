# build
A simple script that will download and build the emulatorjs core files

This script will download and build most of the available retroarch cores.

> **Warning**: Some cores do not compile on ARM based systems (such as M series MacBooks and Raspberry Pi). Use only amd64 based systems to compile.

# Set up your build environment

## VSCode and Dev Containers
This repo contains a devcontainer configuration.

Using docker and VSCode, the repo can be started in a container, where all dependencies are installed for you.

## Local
This guide assumes you're using a Debian or Ubuntu type system.

* Run ``sudo apt update && sudo apt install jq wget curl gpg p7zip-full binutils-mips-linux-gnu build-essential pkgconf python3 git zip libsdl2-dev``

* Run the enclosed ``build_env.sh`` script to configure the build environment. You may need to use sudo to run this script to install system components.

## Rust
Cores written in Rust (currently ``snow``) also need a Rust toolchain. ``build_env.sh`` installs it with rustup. To set it up by hand:

* Install rustup from https://rustup.rs
* Run ``rustup toolchain install 1.95.0 --profile minimal --component rust-src --target wasm32-unknown-emscripten``

The version has to match the ``rust-toolchain.toml`` in the core's repo. ``rust-src`` is needed because the core rebuilds Rust's standard library for the web. ``cargo`` must be on your ``PATH`` (or in ``~/.cargo/bin``) when running ``build.sh``. If anything is missing, the build stops and the core's compile log shows the command to run.

# Compiling
Execute the command ``source ./.emsdk/emsdk_env.sh && bash build.sh`` in the repo root to begin compiling.

Compilation will be performed in ``./compile``, and the completed assets will be copied to ``./output``, with logs in ``./output/logs``.

# Adding new cores
To add a new core, add a stanza like the below:
```json
{
    "name": "mame2003",
    "extensions": [ "zip" ],
    "makeoptions": {
        "buildpath": "./",
        "makescript": "Makefile",
        "arguments": []
    },
    "options": {
        "file": "MAME 2003 (0.78)/MAME 2003 (0.78).opt",
        "settings": {
            "mame2003_skip_disclaimer": "enabled",
            "mame2003_skip_warnings": "enabled"
        },
        "defaultWebGL2": false,
        "supportsMouse": false
    },
    "license": "LICENSE.md",
    "repo": "https://github.com/EmulatorJS/mame2003-libretro",
    "branch": "main"
}
```

| Attribute | Definition |
| --------- | ---------- |
| ``name``      | The name of the core. This value should be the name of the compiled core .data file. |
| ``extensions`` | An array of file extensions used by the core |
| ``license``   | The path to the repo project license file. This path is relative to the root of the repo. |
| ``repo``      | A link to the project repository |
| ``branch``    | The git branch to switch to when building |
| ``makeoptions`` | Settings and options for building the core (see makeoptions table below) |
| ``options``   | Options to be set by the emulator (see options table below) |

### makeoptions
| Attribute | Definition |
| --------- | ---------- |
| ``buildpath`` | The path within the repo to the make script |
| ``makescript`` | The name of the make script |
| ``arguments`` | An array of command line options to pass to the make script |
| ``emcc_flags`` | Extra flags passed to emcc for both the core compile and the RetroArch link (e.g. ``-fwasm-exceptions``) |
| ``custom`` | ``true`` to build with ``build_command`` instead of the make script (see [Build scripts](#build-scripts)) |
| ``build_command`` | The command that builds the core when ``custom`` is ``true`` |
| ``build_retroarch_command`` | Optional command that replaces the standard RetroArch link step for a ``custom`` core |

Local source fixes for a core can be placed in ``patches/<name>.patch``, or as a series in ``patches/<name>/`` (see [Patching cores](#patching-cores)).

### options
| Attribute | Definition |
| --------- | ---------- |
| ``file``      | The relative path and file name for the core options file |
| ``settings``  | A hash table of attributes and their values to write to the core options file |
| ``defaultWebGL2`` | A boolean value of if WebGL2 should be defaulted to enabled |
| ``supportsMouse`` | A boolean value defining if the core supports a mouse |

# Patching cores
The cores are built from their upstream repositories, which mostly target desktop and console platforms. Some need small changes to build for EmulatorJS, for example a makefile whose emscripten target doesn't produce a linkable archive, or symbols that clash with RetroArch. The patch system keeps those changes in this repo, so the core can still be pulled from upstream without forking it.

## How it works
Each patch is a ``git diff`` stored at ``patches/<name>.patch``, where ``<name>`` matches the core's ``name`` in ``cores.json``. ``patches/RetroArch.patch`` applies to RetroArch itself.

A core with many changes can split them into a series instead: a directory ``patches/<name>/`` holding several ``.patch`` files, applied in file name order (so number them, e.g. ``01-port.patch``, ``02-jit.patch``). Text before the first ``diff --git`` line is ignored, so each patch can start with a short description. If both exist, the directory is used.

When ``build.sh`` updates a repo in ``./compile``, it:
1. Reverses the patch, or the series last patch first, if it is already applied, so the working tree is clean
2. Checks out the configured branch and runs ``git pull``
3. Applies the patch, or each patch in the series, again with ``git apply``

If the patch no longer applies (usually because upstream changed the same lines), the build stops. Update the patch against the new upstream code, or delete it if upstream has fixed the problem.

## Creating a patch
1. Build the core once so its repo is cloned to ``./compile/<name>``
2. Edit the files in ``./compile/<name>``
3. Save the changes as the patch: ``git -C compile/<name> diff > patches/<name>.patch``. For a series, save each group of files to its own patch, e.g. ``git -C compile/<name> diff -- <files> > patches/<name>/02-jit.patch``. New files only show up in ``git diff`` after ``git add -N <files>``; run ``git reset <files>`` afterwards so ``build.sh`` can pull cleanly.
4. Rebuild just that core to check it: ``bash build.sh --core=<name>``

Keep each patch to the changes EmulatorJS needs. Fixes that would help every libretro user are better sent upstream, and the patch can be removed once they're merged.

# Build scripts
Most cores build with their own makefile using the ``makeoptions`` above. Some don't fit that pattern. MAME, for example, uses its own build system, and building every MAME driver would make the core far too large. Those cores set ``"custom": true`` and give a ``build_command``, which ``build.sh`` runs in place of the standard make steps. When that command needs more than a line or two, it goes in a script in ``scripts/``, so the logic is readable and can be shared between cores instead of packed into a JSON string.

## How it works
``build.sh`` pulls the core's repo and applies its patch as usual, then runs ``build_command`` with ``eval`` from the root of the core's repo. The command can use these ``build.sh`` variables:

| Variable | Value |
| -------- | ----- |
| ``$initialPath`` | The ``build`` directory, used to reach ``scripts/`` |
| ``$buildPath`` | ``./compile`` |
| ``$tempPath`` | ``RetroArch/emulatorjs/core-temp``, relative to ``$buildPath`` |

The command must leave a static archive named ``<name>_libretro_emscripten.bc`` in each variant folder under ``$buildPath/$tempPath`` that will be linked: ``normal``, ``legacy``, ``threads`` and ``legacyThreads``. Cores with ``requireThreads`` set only need ``threads`` and ``legacyThreads``, and ``legacy`` builds are skipped when ``requiresWebgl2`` is set. ``build.sh`` then links each archive into RetroArch and packs the ``.data`` files as normal. End the command with ``|| exit 1`` so a failed script stops the build.

To replace the RetroArch link step as well, set ``build_retroarch_command``; it runs from ``./compile/RetroArch/emulatorjs``.

## Available scripts
### ``build-mame-subtarget.sh``
Builds libretro MAME with only the listed drivers and merges the result into a single static archive. ``mame_x1``, ``mame_electron`` and ``mame_sg1000`` use it.

```
build-mame-subtarget.sh <subtarget> <sources> <output .bc> [copy destinations...]
```

| Argument | Definition |
| -------- | ---------- |
| ``subtarget`` | Name for the MAME subtarget, e.g. ``x1`` |
| ``sources`` | Comma-separated driver source files to include, e.g. ``src/mame/sharp/x1.cpp,src/mame/sharp/x1twin.cpp`` |
| ``output .bc`` | File name of the merged archive |
| ``copy destinations`` | Folders to copy the archive into, usually the ``core-temp`` variant folders |

The build is threaded only, so cores that use it need ``requireThreads`` set and ``-fwasm-exceptions`` in ``emcc_flags``. See the ``mame_x1`` entry in ``cores.json`` for a complete example.
