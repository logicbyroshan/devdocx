# --- FILE: config/views.py ---

import os
from django.conf import settings
from django.http import HttpResponse, HttpResponseNotFound
from django.views.generic import View

class SPAView(View):
    """
    Serves the compiled React Single Page Application (index.html).
    All client-side routing is handled by React Router in the browser.
    """
    def get(self, request, *args, **kwargs):
        dist_index = os.path.join(settings.BASE_DIR, 'frontend', 'dist', 'index.html')
        if os.path.exists(dist_index):
            with open(dist_index, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/html; charset=utf-8')
        
        # Fallback in case frontend is not built yet
        return HttpResponseNotFound(
            "<h1>DevDocs Frontend Build Missing</h1>"
            "<p>Please build the React application by running <code>cd frontend && npm install && npm run build</code>.</p>"
        )
