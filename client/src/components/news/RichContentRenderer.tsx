import React from 'react';

interface RichContentRendererProps {
  content: string;
  className?: string;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({
  content,
  className = ''
}) => {
  if (!content) return null;

  // Pre-process custom shortcut tags into HTML before rendering
  const preprocessText = (raw: string): string => {
    let processed = raw;

    // Shortcuts: [oro]...[/oro] or [gold]...[/gold]
    processed = processed.replace(
      /\[(?:oro|gold)\]([\s\S]*?)\[\/(?:oro|gold)\]/gi,
      '<span class="text-rayo-gold font-bold">$1</span>'
    );

    // Shortcuts: [rojo]...[/rojo] or [red]...[/red]
    processed = processed.replace(
      /\[(?:rojo|red)\]([\s\S]*?)\[\/(?:rojo|red)\]/gi,
      '<span class="text-rose-400 font-bold">$1</span>'
    );

    // Shortcuts: [cian]...[/cian] or [cyan]...[/cyan]
    processed = processed.replace(
      /\[(?:cian|cyan)\]([\s\S]*?)\[\/(?:cian|cyan)\]/gi,
      '<span class="text-cyan-400 font-bold">$1</span>'
    );

    // Shortcuts: [verde]...[/verde] or [green]...[/green]
    processed = processed.replace(
      /\[(?:verde|green)\]([\s\S]*?)\[\/(?:verde|green)\]/gi,
      '<span class="text-emerald-400 font-bold">$1</span>'
    );

    // Shortcuts: [grande]...[/grande]
    processed = processed.replace(
      /\[grande\]([\s\S]*?)\[\/grande\]/gi,
      '<span class="text-base sm:text-lg font-semibold text-white">$1</span>'
    );

    // Shortcuts: [pequeño]...[/pequeño] or [pequeno]...[/pequeno]
    processed = processed.replace(
      /\[(?:pequeño|pequeno)\]([\s\S]*?)\[\/(?:pequeño|pequeno)\]/gi,
      '<span class="text-xs text-rayo-bone/60">$1</span>'
    );

    // Shortcuts: [resaltar]...[/resaltar]
    processed = processed.replace(
      /\[resaltar\]([\s\S]*?)\[\/resaltar\]/gi,
      '<mark class="bg-rayo-gold/20 text-rayo-gold px-1.5 py-0.5 rounded font-semibold">$1</mark>'
    );

    // Markdown inline: **bold**
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    
    // Markdown inline: *italic* (avoiding match with html or lists)
    processed = processed.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic text-rayo-bone/90">$1</em>');

    // Markdown inline: ~~strikethrough~~
    processed = processed.replace(/~~(.*?)~~/g, '<span class="line-through opacity-60">$1</span>');

    return processed;
  };

  // Split into paragraph blocks
  const blocks = content.split(/\n{2,}/);

  return (
    <div className={`space-y-4 text-sm sm:text-base text-rayo-bone/80 leading-relaxed font-sans ${className}`}>
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Heading 2: ## Title or <h2>Title</h2>
        if (trimmed.startsWith('## ') || /^<h2[^>]*>([\s\S]*?)<\/h2>$/i.test(trimmed)) {
          const text = trimmed.startsWith('## ')
            ? trimmed.slice(3)
            : trimmed.replace(/^<h2[^>]*>([\s\S]*?)<\/h2>$/i, '$1');
          return (
            <h2
              key={idx}
              className="font-display font-bold text-xl sm:text-2xl text-white uppercase tracking-tight mt-6 mb-3 pb-1.5 border-b border-rayo-gold/30 flex items-center gap-2"
              dangerouslySetInnerHTML={{ __html: preprocessText(text) }}
            />
          );
        }

        // Heading 3: ### Title or <h3>Title</h3>
        if (trimmed.startsWith('### ') || /^<h3[^>]*>([\s\S]*?)<\/h3>$/i.test(trimmed)) {
          const text = trimmed.startsWith('### ')
            ? trimmed.slice(4)
            : trimmed.replace(/^<h3[^>]*>([\s\S]*?)<\/h3>$/i, '$1');
          return (
            <h3
              key={idx}
              className="font-display font-semibold text-lg sm:text-xl text-rayo-gold uppercase tracking-tight mt-5 mb-2"
              dangerouslySetInnerHTML={{ __html: preprocessText(text) }}
            />
          );
        }

        // Heading 4: #### Title or <h4>Title</h4>
        if (trimmed.startsWith('#### ') || /^<h4[^>]*>([\s\S]*?)<\/h4>$/i.test(trimmed)) {
          const text = trimmed.startsWith('#### ')
            ? trimmed.slice(5)
            : trimmed.replace(/^<h4[^>]*>([\s\S]*?)<\/h4>$/i, '$1');
          return (
            <h4
              key={idx}
              className="font-display font-semibold text-base text-cyan-300 uppercase mt-4 mb-1.5"
              dangerouslySetInnerHTML={{ __html: preprocessText(text) }}
            />
          );
        }

        // Horizontal Divider: --- or ***
        if (trimmed === '---' || trimmed === '***' || trimmed === '<hr>' || trimmed === '<hr/>') {
          return (
            <div key={idx} className="my-6 flex items-center justify-center gap-3">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="text-rayo-gold text-xs">⚡</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>
          );
        }

        // Blockquote: > Quote or <blockquote>Quote</blockquote>
        if (trimmed.startsWith('> ') || /^<blockquote[^>]*>([\s\S]*?)<\/blockquote>$/i.test(trimmed)) {
          const text = trimmed.startsWith('> ')
            ? trimmed.split('\n').map(l => l.replace(/^>\s?/, '')).join('\n')
            : trimmed.replace(/^<blockquote[^>]*>([\s\S]*?)<\/blockquote>$/i, '$1');
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-rayo-gold pl-4 py-2.5 my-4 bg-gradient-to-r from-rayo-gold/10 via-rayo-gold/5 to-transparent rounded-r-xl italic text-rayo-bone/95 text-sm sm:text-base font-medium shadow-sm"
              dangerouslySetInnerHTML={{ __html: preprocessText(text) }}
            />
          );
        }

        // List lines check (bullet or numbered)
        const lines = trimmed.split('\n');
        const isBulletList = lines.every(l => /^(\s*[-•*]|\s*\d+\.)\s+/.test(l));

        if (isBulletList) {
          const isOrdered = /^\s*\d+\.\s+/.test(lines[0]);
          if (isOrdered) {
            return (
              <ol key={idx} className="space-y-2.5 my-3 pl-1">
                {lines.map((l, lIdx) => {
                  const match = l.match(/^\s*(\d+)\.\s+(.*)$/);
                  const num = match ? match[1] : `${lIdx + 1}`;
                  const itemText = match ? match[2] : l;
                  return (
                    <li key={lIdx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-rayo-gold/20 text-rayo-gold border border-rayo-gold/40 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {num}
                      </span>
                      <span
                        className="flex-1 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: preprocessText(itemText) }}
                      />
                    </li>
                  );
                })}
              </ol>
            );
          } else {
            return (
              <ul key={idx} className="space-y-2 my-3 pl-1">
                {lines.map((l, lIdx) => {
                  const itemText = l.replace(/^\s*[-•*]\s+/, '');
                  return (
                    <li key={lIdx} className="flex items-start gap-2.5">
                      <span className="text-rayo-gold text-base shrink-0 leading-none mt-1">•</span>
                      <span
                        className="flex-1 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: preprocessText(itemText) }}
                      />
                    </li>
                  );
                })}
              </ul>
            );
          }
        }

        // Regular paragraph with linebreaks preserved
        return (
          <p
            key={idx}
            className="leading-relaxed whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: preprocessText(trimmed) }}
          />
        );
      })}
    </div>
  );
};
