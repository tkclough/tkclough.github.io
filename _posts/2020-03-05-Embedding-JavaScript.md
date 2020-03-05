---
layout: post
title: "Embedding JavaScript in Github Pages"
date: 2020-03-05 14:00:00 -0400
categories:
  - tutorial
---

Github Pages is really an amazing resource. People may bash Microsoft for a lot
of things, but they are doing a public service, allowing people to host content
for free, especially students without incomes (like me).

I did't realize until yesterday that it was possible to embed JavaScript into
posts on Github Pages. It's fairly straightforward. 

Suppose you have an HTML page like this, and you want it to appear within a 
post:
```html
<!DOCTYPE html>
<html>
    <head>
        <script src="someurl.com"></script>
        <script src="anotherurl.io"></script>
    </head>
    <body>
        <div id="some-content"></div>
        <script src="main.js"></script>
    </body>
</html>
```

Because the above is a standalone HTML document with all the usual boilerplate,
it won't work if we include it like this. So, rewrite it without the bells and
whistles like so:

```html
<script src="someurl.com"></script>
<script src="anotherurl.io"></script>
<div id="some-content"></div>
<script src="main.js"></script>
```

Now, move this file somewhere within the `_includes` folder. This is where 
snippets like this will live. If you plan on making a bunch of these, it would
be a good idea to organize your files more. Personally, I mirror the `assets`
folder - for example, `_includes/2020/03/04/least_squares.html`. 

The JavaScript source should be moved to the `assets` folder, for example,
`assets/2020/03/04/main.js`. Now, you'll need to update the link to that source
file in your snippet. 

Now, all that's left is to include the snippet in a new markdown post:
```markdown
{{ "{% include 2020/03/04/least_squares.html" }} %}
```

Notice that the path is relative to the `_includes` folder, which is why we put
it there.