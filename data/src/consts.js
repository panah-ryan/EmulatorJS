export const version = "4.3.0-pre";

export const cores = {
    "mame": ["mame2003_plus"],
    "atari2600": ["stella2014"],
    "vic20": ["vice_xvic"],
    "dos": ["dosbox_pure"],
    "pc88": ["quasi88"],
    "atari800": ["atari800"],
    "pc98": ["nekop2"],
    "msx": ["bluemsx"],
    "atarist": ["hatarib"],
    "x68000": ["px68k"],
    "apple2": ["applewin"],
    "segaSaturn": ["beetle_saturn"]
};

export const requiresThreads = ["applewin", "beetle_saturn", "dosbox_pure"];

export const requiresWebGL2 = [];
