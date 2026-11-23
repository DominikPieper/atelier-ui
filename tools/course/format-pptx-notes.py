"""Format the speaker notes of an exported deck .pptx: one paragraph per labelled block,
bold labels, German spelling. Usage: python3 -I tools/course/format-pptx-notes.py <in.pptx> <out.pptx>"""
import re, sys, zipfile
from xml.dom import minidom

LABELS = [
    r'Regie:', r'Ein guter Prompt nennt:', r'Probe-Punkt:', r'Nur für Trainer[^:]{0,30}:',
    r'Ablauf(?: nach Skript \(Skript: Demo D-\d+\))?:', r'Checkpoint:', r'Notausgang:', r'Zur Rettung:',
    r'Zwei Fehlversuche:', r'Typisch gut:', r'Typisch schlecht:', r'Typisch:', r'Nicht zeigen:',
    r'Für zu Hause:', r'Gemessen am [^:]{0,15}:', r'Bei Schweigen[^:.]{0,30}:', r'Demo(?: \(Skript: Demo D-\d+\))?:',
    r'Kein eigenes Set\?', r'Belege[^:]{0,60}:', r'Aufgabe:', r'Erwartet:',
]
LABEL_RE = re.compile('(' + '|'.join(LABELS) + ')')
SAG_RE = re.compile(r'Sag(?: vor der Reparatur)?: „([^“]*)“')
BODY_RE = re.compile(r'(<p:sp>(?:(?!</p:sp>).)*?<p:ph type="body"[^>]*/>(?:(?!</p:sp>).)*?<p:txBody>)(.*?)(</p:txBody>)', re.S)

def run(text, bold=False):
    b = ' b="1"' if bold else ''
    return f'<a:r><a:rPr lang="de-DE"{b} dirty="0"/><a:t>{text}</a:t></a:r>'

def para(runs):
    return f'<a:p><a:pPr><a:spcAft><a:spcPts val="600"/></a:spcAft></a:pPr>{runs}<a:endParaRPr lang="de-DE" dirty="0"/></a:p>'

def format_body(inner):
    texts = re.findall(r'<a:t>(.*?)</a:t>', inner, re.S)
    text = SAG_RE.sub(r'\1', ' '.join(texts)).strip()
    if not text:
        return inner
    head = re.match(r'(<a:bodyPr[^>]*/>|<a:bodyPr.*?</a:bodyPr>)?(<a:lstStyle/>|<a:lstStyle>.*?</a:lstStyle>)?', inner, re.S).group(0)
    parts = LABEL_RE.split(text)
    out = []
    first = parts[0].strip()
    if first:
        # spoken part: paragraphs of at most three sentences, so it scans in presenter view
        sents = re.split(r'(?<=[.!?“])\s+(?=[A-ZÄÖÜ„])', first)
        for k in range(0, len(sents), 3):
            out.append(para(run(' '.join(sents[k:k + 3]))))
    for i in range(1, len(parts), 2):
        out.append(para(run(parts[i], True) + run(' ' + parts[i + 1].strip())))
    return head + ''.join(out)

def main(src, dst):
    n = 0
    with zipfile.ZipFile(src) as zin, zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if re.match(r'ppt/notesSlides/notesSlide\d+\.xml$', item.filename):
                xml = data.decode('utf-8')
                new = BODY_RE.sub(lambda m: m.group(1) + format_body(m.group(2)) + m.group(3), xml, count=1)
                minidom.parseString(new.encode('utf-8'))  # must stay well-formed
                n += new != xml
                data = new.encode('utf-8')
            zout.writestr(item, data)
    print(f'{n} notes formatted -> {dst}')

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
