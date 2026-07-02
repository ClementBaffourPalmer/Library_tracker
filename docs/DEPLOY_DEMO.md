# Demo Hosting Guide

## Recommended host for this project

Use **PythonAnywhere** for the lecturer demo.

Why this fits this repo best:

- This app is a Django project using a local `db.sqlite3` file today.
- PythonAnywhere's Django flow works well with an existing Django codebase and manual WSGI configuration.
- For a demo, it lets you keep the current SQLite database instead of forcing a PostgreSQL migration first.

Relevant official references:

- PythonAnywhere says a free Beginner account includes one web app at `your-username.pythonanywhere.com`: https://www.pythonanywhere.com/pricing/
- PythonAnywhere's Django deployment guide for an existing project: https://help.pythonanywhere.com/pages/DeployExistingDjangoProject/

## Other hosting options

- **Render** is a good second option if you want a Git-based deploy flow. Its docs for Django recommend PostgreSQL and WhiteNoise for production deployments: https://render.com/docs/deploy-django
- Render pricing currently shows a Hobby workspace at `$0/mo + compute`, with free web services and a free Postgres tier listed with a 30-day limit: https://render.com/pricing
- **Railway** is fast, but its official pricing says the free trial is a one-time `$5` credit and the Hobby plan is `$5/month`: https://docs.railway.com/pricing/plans

## What I already changed in this repo

- `DJANGO_SECRET_KEY` can now be supplied from the environment.
- `DJANGO_DEBUG` can now be turned off for hosting.
- `DJANGO_ALLOWED_HOSTS` is already environment-driven.
- `DJANGO_CSRF_TRUSTED_ORIGINS` is now environment-driven.
- `STATIC_ROOT` is defined so `collectstatic` can be used on a hosted environment.

## Fastest path: PythonAnywhere

### 1. Put the code on GitHub

PythonAnywhere recommends cloning from GitHub or Bitbucket in a Bash console.

### 2. Create a PythonAnywhere account

For a quick demo, a Beginner account is enough if you only need one public app URL.

### 3. On PythonAnywhere, clone the repo

In a Bash console:

```bash
git clone <your-repo-url>
cd Lib_Track
```

### 4. Create a virtualenv and install requirements

PythonAnywhere's guide uses `mkvirtualenv` and then `pip install -r requirements.txt`.

Example:

```bash
mkvirtualenv --python=/usr/bin/python3.10 libtrack-venv
workon libtrack-venv
pip install -r requirements.txt
```

### 5. Set environment variables

In the PythonAnywhere Web tab, add these as environment variables for the web app:

```text
DJANGO_SECRET_KEY=<a strong random string>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<your-username>.pythonanywhere.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://<your-username>.pythonanywhere.com
```

For your account, that becomes:

```text
DJANGO_SECRET_KEY=<a strong random string>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=clementPalmer27.pythonanywhere.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://clementPalmer27.pythonanywhere.com
```

### 6. Create the web app

In the Web tab:

- Create a new web app
- Choose **Manual configuration**
- Choose the same Python version you used for the virtualenv
- Set the virtualenv to `libtrack-venv`

### 7. Configure WSGI

Edit the WSGI file PythonAnywhere creates for your domain and use this shape:

```python
import os
import sys

path = "/home/<your-username>/Lib_Track"
if path not in sys.path:
    sys.path.insert(0, path)

os.environ["DJANGO_SETTINGS_MODULE"] = "smartlibrary_tracker.settings"

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
```

For your account, the exact path should be:

```python
import os
import sys

path = "/home/clementPalmer27/Lib_Track"
if path not in sys.path:
    sys.path.insert(0, path)

os.environ["DJANGO_SETTINGS_MODULE"] = "smartlibrary_tracker.settings"

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
```

### 8. Migrate and collect static files

From a Bash console:

```bash
cd ~/Lib_Track
workon libtrack-venv
python manage.py migrate
python manage.py collectstatic --noinput
```

### 9. Configure static files in the Web tab

Add a static mapping:

- URL: `/static/`
- Directory: `/home/<your-username>/Lib_Track/staticfiles`

For your account, use:

- URL: `/static/`
- Directory: `/home/clementPalmer27/Lib_Track/staticfiles`

### 10. Reload the web app

Then open:

```text
https://<your-username>.pythonanywhere.com
```

For you, that URL will be:

```text
https://clementPalmer27.pythonanywhere.com
```

## Demo note

If you want the lecturer to see your current sample data, keep `db.sqlite3` in the deployed project and run migrations without deleting it.

## What I cannot do from here

I cannot complete the public deployment end-to-end without:

- your hosting account login, or
- a connected deployment platform/API I can access from this environment.

If you want, next I can prepare the Git repo for PythonAnywhere upload, or I can switch the app to a full Render-style production setup with PostgreSQL.
