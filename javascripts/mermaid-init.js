document$.subscribe(() => {
  if (window.mermaid) {
    window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
    window.mermaid.run({ querySelector: '.mermaid' });
  }
});


