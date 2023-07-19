import json
import os


def task_bump_version_patch():
    def run():
        with open("package.json", "r") as f:
            d = json.load(f)

        lead, patch = d["version"].rsplit(".", 1)
        d["version"] = lead + "." + str(int(patch) + 1)

        with open("package.json", "w") as f:
            json.dump(d, f, indent=2)

    return {
        "actions": [run],
    }


def task_build():
    return {
        "actions": [
            "rm -rf _output",
            "yarn run build:prod",
            "python -m build",
            "jupyter lite build --force",
        ],
    }


def update_jlite_json_quickbuild():
    jlite_config_path = "../web/public/jlite/jupyter-lite.json"
    # first read in existing jupyter-lite.jsonfile
    with open(jlite_config_path, "r") as f:
        jlite = json.load(f)

    # then find name of file starting with `remoteEntry.` within
    # the ./jupyteach_jupyterlite_contents/labextension/static directory
    remoteEntry = [
        f
        for f in os.listdir("./jupyteach_jupyterlite_contents/labextension/static")
        if f.startswith("remoteEntry.")
    ][0]

    # find the object within jlite['federated_extensions'] that has name == '@jupyteach/jupyterlite-contents'
    ext = None
    for e in jlite["jupyter-config-data"]["federated_extensions"]:
        if e["name"] == "@jupyteach/jupyterlite-contents":
            ext = e
            break

    if ext is None:
        raise ValueError(
            "Could not find @jupyteach/jupyterlite-contents in jupyter-lite.json"
        )

    # update the 'load' property of `ext` to match `static/{remoteEntry}`
    ext["load"] = f"static/{remoteEntry}"

    # now write out updated jupyter-lite-json file to jlite_config_path. Use indent=2
    # to make it human readable
    with open(jlite_config_path, "w") as f:
        json.dump(jlite, f, indent=2)


def task_devbuild():
    return {
        "actions": [
            "rm -rf _output",
            "yarn run build:prod",
            "rm -rf ../web/public/jlite/extensions/@jupyteach/jupyterlite-contents",
            "mkdir -p ../web/public/jlite/extensions/@jupyteach/jupyterlite-contents",
            "jupyter lite build --force",
            "rsync -av --delete ./_output/ ../web/public/jlite/",
            update_jlite_json_quickbuild,
        ],
    }


def task_quickbuild():
    return {
        "actions": [
            "yarn run build:prod",
            "rm -rf ../web/public/jlite/extensions/@jupyteach/jupyterlite-contents",
            "mkdir -p ../web/public/jlite/extensions/@jupyteach/jupyterlite-contents",
            "rsync -av --delete ./jupyteach_jupyterlite_contents/labextension/static/ ../web/public/jlite/extensions/@jupyteach/jupyterlite-contents/static/",
            update_jlite_json_quickbuild,
        ],
    }
