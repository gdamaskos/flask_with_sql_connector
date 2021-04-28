#!/usr/bin/env bash
export LAHMA_SETTINGS=../config/lahma_settings.cfg
gunicorn -b 0.0.0.0:8080 --reload --log-level debug --log-file "-" -k gevent lahma:app
