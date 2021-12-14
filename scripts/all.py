""" Run all the scripts in this module in sequence."""

import subprocess

if __name__ == '__main__':
    subprocess.run(
        [
            "python fetch.py" +
            " && python process.py" +
            " && python clean.py" +
            " && python append.py" +
            " && python package.py"
        ],
        shell=True
    )
