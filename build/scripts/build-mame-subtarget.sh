#!/bin/bash
# Builds a libretro MAME core limited to a few drivers and merges it into one static archive.
# Run from the MAME source directory:
#   build-mame-subtarget.sh <subtarget> <sources> <output .bc> [copy destinations...]
# e.g. build-mame-subtarget.sh x1 src/mame/sharp/x1.cpp,src/mame/sharp/x1twin.cpp mame_x1_libretro_emscripten.bc dir1 dir2

subtarget="$1"
sources="$2"
output="$3"
shift 3

if [ -z "$subtarget" ] || [ -z "$sources" ] || [ -z "$output" ]; then
    echo "usage: $0 <subtarget> <sources> <output .bc> [copy destinations...]"
    exit 1
fi

# MAME's makefile needs EMSCRIPTEN set to pick the asmjs target
export EMSCRIPTEN="${EMSCRIPTEN:-$EMSDK/upstream/emscripten}"

# The final step links a standalone wasm shared library that the frontend doesn't use, and it
# fails on -lutil, so only the static libraries below matter; a real compile error leaves one missing
emmake make -j$(nproc) \
    OSD=retro CONFIG=libretro TARGETOS=asmjs PTR64=0 NOASM=1 \
    REGENIE=1 VERBOSE=1 NOWERROR=1 NO_USE_MIDI=1 NO_USE_PORTAUDIO=1 DONT_USE_NETWORK=1 \
    PYTHON_EXECUTABLE=python3 \
    TARGET=mame SUBTARGET="$subtarget" SOURCES="$sources" \
    ARCHOPTS="-pthread -fwasm-exceptions"

objdir="build/libretro/obj/libretro"
bindir="build/libretro/bin"
objects=(
    "$objdir/src/mame/mame.o"
    "$objdir/src/osd/libretro/libretro-internal/libretro.o"
    "$objdir/src/osd/libretro/retromain.o"
    "$objdir/generated/mame/$subtarget/drivlist.o"
    "$objdir/generated/version.o"
)
# same order as MAME's own link
archives=(
    "mame_$subtarget/libmame_$subtarget.a" libfrontend.a "mame_$subtarget/liboptional.a" libemu.a
    "mame_$subtarget/libosd_retro.a" "mame_$subtarget/libformats.a" "mame_$subtarget/libdasm.a"
    libutils.a libexpat.a libsoftfloat3.a libwdlfft.a libymfm.a libjpeg.a lib7z.a liblua.a
    liblualibs.a liblinenoise.a libzlib.a libzstd.a libflac.a libutf8proc.a libsqlite3.a
    "mame_$subtarget/libocore_retro.a"
)

{
    echo "create $output"
    for o in "${objects[@]}"; do
        [ -f "$o" ] || { echo "missing $o" >&2; exit 1; }
        echo "addmod $o"
    done
    for a in "${archives[@]}"; do
        [ -f "$bindir/$a" ] || { echo "missing $bindir/$a" >&2; exit 1; }
        echo "addlib $bindir/$a"
    done
    echo "save"
    echo "end"
} > merge.mri || exit 1

rm -f "$output"
emar -M < merge.mri || exit 1
rm -f merge.mri

for dest in "$@"; do
    cp "$output" "$dest/" || exit 1
done
