<div align="center">

<img src="styles/nt/new-year/hat.svg" width="88" alt="">

# [nt] New Year decorations

New Year decorations for XenForo 2.3: snowfall, snow on blocks, a hat on the logo and a countdown to the New Year.

[![XenForo](https://img.shields.io/badge/XenForo-2.3%2B-2577b1?style=flat-square)](https://xenforo.com)
[![Release](https://img.shields.io/github/v/release/mityakuss-pixel/nt-new-year?style=flat-square&label=Release&color=2577b1)](https://github.com/mityakuss-pixel/nt-new-year/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/mityakuss-pixel/nt-new-year/total?style=flat-square&label=Downloads&color=2577b1)](https://github.com/mityakuss-pixel/nt-new-year/releases)
[![License](https://img.shields.io/github/license/mityakuss-pixel/nt-new-year?style=flat-square&label=License&color=2577b1)](LICENSE)

[Русский](README.md) · **English**

</div>

## Features

- **Snowfall.** Three layers of flakes with different sizes and speeds.
- **Snow caps** on category blocks, sidebar blocks and buttons like "Post thread". Every block gets its own cap, and they change once a day.
- **A hat on the logo**, if the logo is an image.
- **A New Year countdown** in the navigation, to the left of the user menu. It uses the visitor's device time and turns into a greeting in January.
- **Opt-out per user.** A checkbox in account preferences hides the decorations for that user only.

## Performance

Flakes are moved by CSS animations. The script creates them once on page load and does almost nothing after that.

- Snow is paused in background tabs.
- The number of flakes depends on the screen size and is lower on weak devices.
- No snow at all with "reduce motion" enabled in the OS or data saver enabled in the browser.
- No external requests and no third-party libraries.

## Requirements

- XenForo 2.3.0 or later.

## Installation

1. Download `NT-NewYear-1.0.4.zip` from the [releases page](https://github.com/mityakuss-pixel/nt-new-year/releases/latest).
2. In the admin control panel open **Add-ons → Install/upgrade from archive** and choose the archive.

If there is no install from archive button, unpack the archive, upload the contents of the `upload` folder to the forum root and install the add-on from the **Add-ons** list. The same from the command line:

```bash
php cmd.php xf-addon:install NT/NewYear
```

Upgrades from earlier versions use the same archive.

A Russian translation is available as `NT-NewYear-1.0.4-ru.zip` on the same page. Import it via **Appearance → Languages → Import language** over your Russian language.

## Options

**Setup → Options → [nt] New Year decorations**:

| Option | Default |
|---|---|
| Show decorations | by dates |
| First day and last day | 15.12 to 14.01 |
| Snowflakes on screen | 60, from 0 to 150 |
| Snow on blocks | on |
| Santa hat on the logo | on |
| New Year countdown in the navigation | on |

Besides "by dates" there are "always" and "never". Dates follow the guest time zone set in the forum options.

## Style properties

**Appearance → Style properties → [nt] New Year decorations**:

- flake, snow cap, cap shade and cap outline colors, each with a light and a dark variation;
- countdown look: background, border radius, padding, font size;
- hat width and its offset from the logo.

The add-on does not edit core templates. The markup is added by three template modifications, the styles are in `nt_new_year.less` and `nt_new_year_hat.less`.

## Uninstall

Uninstall it as usual from **Add-ons**. Its options, phrases, templates and the `nt_new_year_disabled` column in `xf_user_option` are removed with it.

## Development

The repository mirrors the forum root:

```
src/addons/NT/NewYear/   code and _output
js/nt/new_year.js        snow, caps and countdown
styles/nt/new-year/      hat as SVG
```

Copy the files into a forum with development mode enabled, install the add-on and import `_output`:

```bash
php cmd.php xf-addon:install NT/NewYear
php cmd.php xf-dev:import --addon=NT/NewYear
```

Build a release:

```bash
php cmd.php xf-addon:build-release NT/NewYear
```

## License

[MIT](LICENSE)
