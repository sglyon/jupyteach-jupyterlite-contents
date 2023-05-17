import json


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


def task_devbuild():
    return {
        "actions": [
            "rm -rf _output",
            "yarn run build:prod",
            "jupyter lite build --force",
            "rsync -av --delete ./_output/ ~/src/jupyteach/jupyteach-rw/web/public/jlite/",
        ],
    }


def task_quickbuild():
    return {
        "actions": [
            "yarn run build:prod",
            "rsync -av --delete ./jupyteach_jupyterlite_contents/labextension/static/ ../web/public/jlite/extensions/@jupyteach/jupyterlite-contents/static/",
        ],
    }
