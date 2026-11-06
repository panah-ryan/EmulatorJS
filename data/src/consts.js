export const version = "4.3.0-pre";

export const cores = {
    "mame": ["mame2003_plus"],
    "neogeo": ["fbneo"],
    "nes": ["nestopia"],
    "snes": ["snes9x"],
    "n64": ["mupen64plus_next"],
    "gb": ["sameboy"],
    "gba": ["mgba"],
    "nds": ["melonds_ds"],
    "atari2600": ["stella2014"],
    "vic20": ["vice_xvic"],
    "c64": ["vice_x64sc"],
    "c128": ["vice_x128"],
    "plus4": ["vice_xplus4"],
    "amiga": ["puae"],
    "amigacd32": ["puae"],
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
    "sega32x": ["picodrive"],
    "pce": ["mednafen_pce_fast"],
    "psx": ["swanstation"],
    "psp": ["ppsspp"],
    "ps2": ["tabstationtoo"],
    "xbox": ["xemu"],
    "gamecube": ["dolphin"],
    "dreamcast": ["flycast"],
    "3do": ["opera"],
    "pc88": ["quasi88"],
    "atari800": ["atari800"],
    "atari5200": ["atari800"],
    "atari7800": ["prosystem"],
    "jaguar": ["virtualjaguar"],
    "lynx": ["mednafen_lynx"],
    "ngp": ["mednafen_ngp"],
    "ws": ["mednafen_wswan"],
    "pc98": ["np2kai"],
    "pcfx": ["mednafen_pcfx"],
    "fmtowns": ["geartowns"],
    "msx": ["bluemsx"],
    "atarist": ["hatarib"],
    "x68000": ["px68k"],
    "apple2": ["applewin"],
    "segaSaturn": ["emir"]
};


// core options left out of the settings menu
export const hiddenCoreOptions = {
    "mame2003_plus": [
        "mame2003-plus_display_setup",
        "mame2003-plus_mame_remapping",
        "mame2003-plus_cheat_input_ports",
        "mame2003-plus_autosave_hiscore",
        "mame2003-plus_input_toggle",
        "mame2003-plus_input_interface",
        "mame2003-plus_core_sys_subfolder",
        "mame2003-plus_core_save_subfolder",
        "mame2003-plus_use_samples",
        "mame2003-plus_use_alt_sound"
    ],
    "atari800": [
        "atari800_pdevice",
        "atari800_rdevice",
        "atari800_cfg"
    ],
    "vice_xvic": [
        "vice_printer",
        "vice_read_vicerc",
        "vice_cartridge"
    ],
    "vice_x64sc": [
        "vice_printer",
        "vice_read_vicerc",
        "vice_jiffydos",
        "vice_cartridge"
    ],
    "vice_x128": [
        "vice_printer",
        "vice_read_vicerc",
        "vice_jiffydos",
        "vice_cartridge"
    ],
    "vice_xplus4": [
        "vice_printer",
        "vice_read_vicerc",
        "vice_cartridge"
    ],
    "cap32": [
        "cap32_lightgun_input",
        "cap32_lightgun_show"
    ],
    "genesis_plus_gx": [
        "genesis_plus_gx_gun_input"
    ],
    "fbneo": [
        "fbneo-allow-patched-romsets",
        "fbneo-hiscores",
        "fbneo-lightgun-crosshair-emulation",
        "fbneo-resolution"
    ],
    "geartowns": [
        "geartowns_cdrom_fast_forward_notification"
    ],
    "hatarib": [
        "hatarib_midi"
    ],
    "opera": [
        "opera_kprint"
    ],
    "virtualjaguar": [
        "virtualjaguar_netlink",
        "virtualjaguar_uart_device",
        "virtualjaguar_netlink_host",
        "virtualjaguar_netlink_port",
        "virtualjaguar_netlink_wait",
        "virtualjaguar_netlink_speed",
        "virtualjaguar_voice_chat",
        "virtualjaguar_voice_chat_gate",
        "virtualjaguar_voice_chat_ptt_key",
        "virtualjaguar_voice_chat_volume",
        "virtualjaguar_voice_chat_vad",
        "virtualjaguar_voice_chat_monitor",
        "virtualjaguar_crash_detect",
        "virtualjaguar_cd_trace",
        "virtualjaguar_texture_dump",
        "virtualjaguar_texdump_16bpp",
        "virtualjaguar_gdb_stub",
        "virtualjaguar_gdb_bind",
        "virtualjaguar_gdb_port",
        "virtualjaguar_gdb_wait",
        "virtualjaguar_gdb_halt_timeout"
    ],
    "quasi88": [
        "q88_save_to_disk_image"
    ],
    "np2kai": [
        "np2kai_uselasthddmount"
    ],
    "px68k": [
        "px68k_save_fdd_path",
        "px68k_save_hdd_path"
    ],
    "snes9x": [
        "snes9x_lightgun_mode"
    ],
    "bluemsx": [
        "hard_reset_f12"
    ],
    "fuse": [
        "fuse_uspeech",
        "fuse_display_joystick_type",
        "fuse_display_emulation_speed"
    ],
    "mame_x1": [
        "mame_thread_mode",
        "mame_cheats_enable",
        "mame_boot_to_osd",
        "mame_boot_to_bios",
        "mame_mame_paths_enable",
        "mame_softlists_enable",
        "mame_softlists_auto_media",
        "mame_media_type",
        "mame_cpu_overclock",
        "mame_cpu_sound_overclock",
        "mame_autoloadfastforward",
        "mame_coin_limit",
        "mame_mouse_enable",
        "mame_lightgun_mode",
        "mame_lightgun_offscreen_mode",
        "mame_buttons_profiles"
    ],
    "mame_sg1000": [
        "mame_thread_mode",
        "mame_cheats_enable",
        "mame_boot_to_osd",
        "mame_boot_to_bios",
        "mame_mame_paths_enable",
        "mame_softlists_enable",
        "mame_softlists_auto_media",
        "mame_media_type",
        "mame_cpu_sound_overclock",
        "mame_autoloadfastforward",
        "mame_coin_limit",
        "mame_rotation_mode",
        "mame_mouse_enable",
        "mame_lightgun_mode",
        "mame_lightgun_offscreen_mode",
        "mame_buttons_profiles"
    ],
    "mame_electron": [
        "mame_thread_mode",
        "mame_cheats_enable",
        "mame_boot_to_osd",
        "mame_boot_to_bios",
        "mame_mame_paths_enable",
        "mame_softlists_enable",
        "mame_softlists_auto_media",
        "mame_media_type",
        "mame_cpu_sound_overclock",
        "mame_autoloadfastforward",
        "mame_coin_limit",
        "mame_joystick_deadzone",
        "mame_joystick_saturation",
        "mame_joystick_threshold",
        "mame_mame_4way_enable",
        "mame_rotation_mode",
        "mame_mouse_enable",
        "mame_lightgun_mode",
        "mame_lightgun_offscreen_mode",
        "mame_buttons_profiles"
    ]
};

// systems that get the on-screen keyboard on touch devices
export const keyboardSystems = ["vic20", "c64", "c128", "plus4", "amiga", "cpc", "mac", "zxspectrum", "dos", "x1", "electron", "sg1000", "pc88", "atari800", "pc98", "fmtowns", "msx", "atarist", "x68000", "apple2"];

// systems where a touch on the game screen acts as the mouse
export const mouseSystems = ["mac", "nds"];

// systems where the game screen acts as a trackpad, for cores that read relative mouse movement
export const trackpadSystems = ["amiga", "atarist", "x68000", "fmtowns"];

// core options forced for a system, such as one that shares its core with another system
export const systemCoreOptions = {
    "atari5200": { "atari800_system": "5200" },
    "amigacd32": { "puae_model": "CD32" },
    // picodrive defaults to a 3 button pad
    "sega32x": { "picodrive_input1": "6 button pad", "picodrive_input2": "6 button pad" }
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

// rewind the tape and load its first program; this runs again after every reset
const electronChainTape = [
    "manager.machine.cassettes[\":cassette\"]:seek(0, \"set\")",
    "emu.keypost('CHAIN\"\"\\n')"
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
            { "device": "cass", "count": 1, "extensions": ["uef", "csw", "wav"], "args": ["-exp", "\"\""], "autobootScript": electronChainTape },
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
