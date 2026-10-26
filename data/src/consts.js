export const version = "4.3.0-pre";

export const cores = {
    "mame": ["mame2003_plus"],
    "neogeo": ["fbneo"],
    "nes": ["nestopia"],
    "snes": ["snes9x"],
    "gb": ["sameboy"],
    "atari2600": ["stella2014"],
    "vic20": ["vice_xvic"],
    "c64": ["vice_x64sc"],
    "c128": ["vice_x128"],
    "plus4": ["vice_xplus4"],
    "amiga": ["puae"],
    "cpc": ["cap32"],
    "mac": ["snow"],
    "zxspectrum": ["fuse"],
    "dos": ["dosbox_pure"],
    "x1": ["mame_x1"],
    "electron": ["mame_electron"],
    "sg1000": ["mame_sg1000"],
    "segaMS": ["genesis_plus_gx"],
    "segaGG": ["genesis_plus_gx"],
    "segaMD": ["genesis_plus_gx"],
    "segaCD": ["genesis_plus_gx"],
    "pce": ["mednafen_pce_fast"],
    "pc88": ["quasi88"],
    "atari800": ["atari800"],
    "atari5200": ["atari800"],
    "atari7800": ["prosystem"],
    "lynx": ["mednafen_lynx"],
    "pc98": ["nekop2"],
    "fmtowns": ["geartowns"],
    "msx": ["bluemsx"],
    "atarist": ["hatarib"],
    "x68000": ["px68k"],
    "apple2": ["applewin"],
    "segaSaturn": ["beetle_saturn"]
};

export const requiresThreads = ["applewin", "beetle_saturn", "dosbox_pure", "mame_x1", "mame_electron", "mame_sg1000"];

export const requiresWebGL2 = [];

// systems that get the on-screen keyboard on touch devices
export const keyboardSystems = ["vic20", "c64", "c128", "plus4", "amiga", "cpc", "mac", "zxspectrum", "dos", "x1", "electron", "sg1000", "pc88", "atari800", "pc98", "fmtowns", "msx", "atarist", "x68000", "apple2"];

// systems where a touch on the game screen acts as the mouse
export const mouseSystems = ["mac"];

// systems where the game screen acts as a trackpad, for cores that read relative mouse movement
export const trackpadSystems = ["amiga", "atarist", "x68000", "fmtowns"];

// core options forced for systems that share a core with another system
export const systemCoreOptions = {
    "atari5200": { "atari800_system": "5200" }
};

// hold SHIFT and tap BREAK on an Electron, which boots the disk in the Plus 3
const electronShiftBreak = [
    "local ports = manager.machine.ioport.ports",
    "local shift = ports[\":LINE.13\"]:field(0x08)",
    "local brk = ports[\":BRK\"]:field(0x01)",
    "local frame = 0",
    "shiftbreak = emu.add_machine_frame_notifier(function()",
    "    frame = frame + 1",
    "    if frame == 1 then shift:set_value(1) brk:set_value(1)",
    "    elseif frame == 5 then brk:set_value(0)",
    "    elseif frame == 60 then shift:set_value(0) shiftbreak = nil end",
    "end)"
].join("\n");

// systems run on a MAME core through a generated .cmd file: the MAME driver, which MAME device
// each file extension is loaded into, optional extra arguments, and keys to type or a Lua
// script to run once booted
export const mameSystems = {
    "x1": {
        "driver": "x1",
        "media": [
            { "device": "flop", "count": 4, "extensions": ["2d", "d88", "d77", "1dd", "hfe", "mfi", "dfi", "td0", "imd"] },
            { "device": "cass", "count": 1, "extensions": ["tap", "wav"] }
        ]
    },
    "electron": {
        "driver": "electron",
        "media": [
            // without the default Plus 3 the Electron boots into the tape filing system
            { "device": "cass", "count": 1, "extensions": ["uef", "csw", "wav"], "args": ["-exp", "\"\""], "autoboot": "CHAIN\"\"\\n" },
            // the Plus 3's default ADFS ROM; the Plus 1 the driver adds behind it isn't needed
            { "device": "flop", "count": 1, "extensions": ["adf", "adl"], "args": ["-exp:plus3:exp", "\"\""], "autobootScript": electronShiftBreak },
            // DFS disks need the Plus 3's DFS ROM instead
            { "device": "flop", "count": 1, "extensions": ["ssd", "dsd"], "args": ["-exp", "plus3,bios=dfs200", "-exp:plus3:exp", "\"\""], "autobootScript": electronShiftBreak }
        ]
    },
    "sg1000": {
        "driver": "sg1000",
        "media": [
            { "device": "cart", "count": 1, "extensions": ["sg", "bin"] },
            // SC-3000 cartridges need its keyboard
            { "device": "cart", "count": 1, "extensions": ["sc"], "driver": "sc3000" }
        ]
    }
};
