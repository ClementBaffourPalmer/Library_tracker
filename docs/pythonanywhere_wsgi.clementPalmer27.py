import os
import sys

path = "/home/clementPalmer27/Library_tracker"
if path not in sys.path:
    sys.path.insert(0, path)

os.environ["DJANGO_SETTINGS_MODULE"] = "smartlibrary_tracker.settings"

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
