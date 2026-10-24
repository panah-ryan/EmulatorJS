# Cores are linked statically into RetroArch, so turn SHARED libraries into STATIC ones.
# Emscripten 4+ supports side modules and would otherwise build a .so that never gets merged.
set_property(GLOBAL PROPERTY TARGET_SUPPORTS_SHARED_LIBS FALSE)
