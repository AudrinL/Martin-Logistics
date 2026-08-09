# -*- coding: utf-8 -*-
"""Stamp the interior pages from one shared shell.

Nav, footer and script tags are identical on every page; this keeps them that
way. Output is plain static HTML — nothing runs at serve time.

    python _tools/build_pages.py
"""
import io
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

NAV = [
    ("index.html", "Index"),
    ("about.html", "About"),
    ("services.html", "Services"),
    ("fleet.html", "Fleet"),
    ("news.html", "News"),
    ("contact.html", "Contact"),
]

FAVICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'"
    "%3E%3Crect width='100' height='100' rx='18' fill='%230B0B0C'/%3E%3Ctext x='50' y='70'"
    " font-family='Arial Black' font-size='60' fill='%23EDD836' text-anchor='middle'%3EM"
    "%3C/text%3E%3C/svg%3E"
)

ARR = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
       '<path d="M7 17L17 7M17 7H8M17 7V16"/></svg>')


def chrome(active):
    links = "\n".join(
        '      <a href="{}"{}>{}</a>'.format(h, ' class="on"' if h == active else "", t)
        for h, t in NAV)
    sheet = "\n".join('    <a href="{}">{}</a>'.format(h, t) for h, t in NAV)
    return """<header class="nav solid" id="nav">
  <div class="nav__in">
    <a href="index.html" class="nav__logo" aria-label="Martin Logistics — home">
      <img src="assets/img/logo-light-word.png" alt="Martin Logistics">
    </a>
    <nav class="nav__links">
{links}
    </nav>
    <div class="nav__end">
      <a href="contact.html" class="btn btn--fill btn--sm"><span>Get a quote</span>{arr}</a>
      <button class="burger" id="burger" aria-label="Menu"><i></i><i></i></button>
    </div>
  </div>
</header>

<div class="sheet" id="sheet">
  <nav class="sheet__nav">
{sheet}
  </nav>
  <div class="sheet__foot">
    KK 13 Ave, Kigali — Gasabo Free Zone<br>
    +250 780 898 115 &nbsp;·&nbsp; +250 787 460 120<br>
    info@martinhardware.rw
  </div>
</div>""".format(links=links, sheet=sheet, arr=ARR)


def cta(head):
    return """<section class="bay cta">
  <img class="cta__truck" src="assets/img/truck-side-twyford-02-cut.webp" alt="" data-par="-5">
  <div class="wrap cta__in">
    <h2 class="h h1 cta__t rv">{head}</h2>
    <div class="cta__acts">
      <a href="contact.html" class="btn btn--fill"><span>Request a quote</span>{arr}</a>
      <a href="tel:+250780898115" class="btn btn--line"><span>+250 780 898 115</span></a>
    </div>
  </div>
</section>""".format(head=head, arr=ARR)


FOOTER = """<footer class="ft">
  <div class="wrap">
    <div class="ft__top">
      <div>
        <a href="index.html" class="ft__logo"><img src="assets/img/logo-light.png" alt="Martin Logistics"></a>
        <p class="ft__d">The logistics and transport division of Martin Hardware Ltd — moving freight between the coast and Kigali, and across Rwanda, the DRC and East Africa.</p>
        <a href="https://www.martinhardware.rw" target="_blank" rel="noopener" class="ft__parent">Martin Hardware Ltd ↗</a>
      </div>
      <div>
        <div class="ft__h">Index</div>
        <ul class="ft__l">
          <li><a href="index.html">Home</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="services.html">Services</a></li>
          <li><a href="fleet.html">Fleet</a></li>
          <li><a href="news.html">News</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <div class="ft__h">Services</div>
        <ul class="ft__l">
          <li><a href="services.html">Goods transportation</a></li>
          <li><a href="services.html">Cross-border &amp; port</a></li>
          <li><a href="services.html">Abroad goods storage</a></li>
          <li><a href="services.html">Delivery &amp; warehousing</a></li>
        </ul>
      </div>
      <div>
        <div class="ft__h">Contact</div>
        <ul class="ft__c">
          <li>KK 13 Ave, Kigali, Rwanda<br>Gasabo District — Free Zone</li>
          <li><a href="tel:+250780898115">+250 780 898 115</a><br><a href="tel:+250787460120">+250 787 460 120</a></li>
          <li><a href="mailto:info@martinhardware.rw">info@martinhardware.rw</a></li>
        </ul>
      </div>
    </div>
    <div class="ft__bot">
      <span>© <span id="yr">2026</span> Martin Logistics — A department of Martin Hardware Ltd</span>
      <div class="ft__soc"><a href="#">Facebook</a><a href="#">LinkedIn</a><a href="#">X</a></div>
    </div>
  </div>
</footer>"""

SCRIPTS = """<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="js/site.js"></script>"""


def page(filename, title, desc, active, body, extra=""):
    html = """<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="{fav}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="css/site.css">
</head>
<body>

<div class="cur" id="cur"></div>

{chrome}

{body}

{footer}

{scripts}
{extra}
</body>
</html>
""".format(title=title, desc=desc, fav=FAVICON, chrome=chrome(active),
           body=body, footer=FOOTER, scripts=SCRIPTS, extra=extra)
    with io.open(os.path.join(ROOT, filename), "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", filename, len(html) // 1024, "KB")


def phero(crumb, kick, title, lede, extra=""):
    return """<section class="phero ink">
  <div class="wrap">
    <div class="phero__crumb fade"><a href="index.html">Index</a> — {crumb}</div>
    <div class="kick fade">{kick}</div>
    <h1 class="h h1 phero__t rv">{title}</h1>
    <p class="lede phero__s rise">{lede}</p>
{extra}
  </div>
</section>""".format(crumb=crumb, kick=kick, title=title, lede=lede, extra=extra)


# ══════════════════════════════════════════════════════════════════ ABOUT ══
TIMELINE = [
    ("2012", "Foundation",
     "Madam Cecile Uwiduhaye founds Martin Hardware Ltd, importing wall tiles, floor tiles, "
     "house glass and household products into Rwanda. The head office opens in Gasabo District, "
     "with branches following in Gisozi and Kimironko."),
    ("2015", "The first fleet",
     "With fifteen trucks, the company begins hauling its own tile and glass imports rather than "
     "relying on third-party carriers. The same year a partnership with Keda Kenya, Tanzania and "
     "The Africa Import &amp; Export Ltd takes Martin Hardware to roughly 60% of Rwanda's tile market."),
    ("2020", "Regional partnerships",
     "Agreements are signed with Bolloré Transport &amp; Logistics Rwanda, JBL Logistics Group, "
     "Simba Cargo, R&amp;M Logistics, Intelgraca, YITIYAN, OLIU Logistics and AGANZE Group — covering "
     "transportation, clearing, shipping and warehousing."),
    ("2025", "Scaling up",
     "The fleet reaches 100 trucks and 102 trailers, with a standing commitment to add ten more of "
     "each every year — specialising in the Dar es Salaam–Kigali, Mombasa–Kigali and Kigali–DRC "
     "corridors, plus raw material for the group's tyre-retreading line."),
    ("Today", "Regional reach",
     "Freight moves daily between the ports of Mombasa and Dar es Salaam, through Kigali, and onward "
     "into the DRC and every province of Rwanda — one accountable team handling transport, clearing "
     "and delivery end to end."),
]

about_body = phero(
    "About", "Est. 2015 · Gasabo, Kigali",
    "Twelve years.<br>One relentless yard.",
    "Martin Logistics began as a way to move our own hardware stock. It grew into a transport "
    "operation carrying freight for some of East Africa's biggest names — built truck by truck, "
    "year on year, out of Kigali."
) + """

<section class="bay pap">
  <div class="wrap">
    <div class="kick fade">The story</div>
    <h2 class="h h2 rv" style="margin-top:22px; max-width:18ch">Fifteen trucks became two hundred and two units.</h2>
    <div style="margin-top:var(--gap-h)">
""" + "\n".join("""      <div class="tl__row rise">
        <div class="tl__y">{y}</div>
        <div>
          <h3 class="h h3 tl__t">{t}</h3>
          <p class="tl__d">{d}</p>
        </div>
      </div>""".format(y=y, t=t, d=d) for y, t, d in TIMELINE) + """
    </div>
  </div>
</section>

<section class="bay ink">
  <div class="wrap">
    <div class="kick fade">Vision &amp; mission</div>
    <h2 class="h h2 rv" style="margin-top:22px">Where we're headed.</h2>
    <div class="duo">
      <div class="duo__c rise">
        <div class="duo__l">Vision</div>
        <p class="duo__t">To carry goods across Rwanda, the DRC and every East and Southern African country we can reach by road.</p>
      </div>
      <div class="duo__c rise">
        <div class="duo__l">Mission</div>
        <p class="duo__t">To build a world-class, environmentally responsible transport business that ranks among Rwanda's top three operators.</p>
      </div>
    </div>
  </div>
</section>

<section class="bay pap">
  <div class="wrap">
    <div class="kick fade">Leadership</div>
    <h2 class="h h2 rv" style="margin-top:22px">Founder-led, from day one.</h2>
    <div class="split2" style="margin-top:var(--gap-h); align-items:start">
      <blockquote class="h h3" style="font-weight:400; line-height:1.4">
        &ldquo;Improving quality of life with a unified approach.&rdquo;
      </blockquote>
      <div>
        <div class="tag">Madam Cecile Uwiduhaye — CEO &amp; Founder</div>
        <p class="lede" style="margin-top:16px">
          With more than twelve years in business, Madam Uwiduhaye started Martin Hardware Ltd in
          2012 and has personally steered its growth from a Kigali tile importer into a hardware
          and logistics group running a hundred-truck fleet.
        </p>
        <p class="lede" style="margin-top:14px">
          The logistics division carries the same standard: own the trucks, own the schedule,
          answer for the delivery.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="bay ink">
  <div class="wrap">
    <div class="kick fade">Where we're based</div>
    <h2 class="h h2 rv" style="margin-top:22px">Head office &amp; branches.</h2>
    <div class="trio">
      <div class="trio__c rise">
        <div class="trio__tag">Head office</div>
        <div class="h h3 trio__n">Gasabo</div>
        <p class="trio__a">KK 13 Ave, Kigali, Rwanda<br>Free Zone</p>
      </div>
      <div class="trio__c rise">
        <div class="trio__tag">Branch</div>
        <div class="h h3 trio__n">Gisozi</div>
        <p class="trio__a">Tiles, glass &amp; house sanitations<br>Kigali, Rwanda</p>
      </div>
      <div class="trio__c rise">
        <div class="trio__tag">Branch</div>
        <div class="h h3 trio__n">Kimironko</div>
        <p class="trio__a">Tiles, glass &amp; house sanitations<br>Kigali, Rwanda</p>
      </div>
    </div>
  </div>
</section>

""" + cta("See the fleet that moves it.")


# ═══════════════════════════════════════════════════════════════ SERVICES ══
SERVICES = [
    ("01", "Logistics &amp; goods transportation",
     "Full-load and part-load freight haulage across Rwanda, the DRC and East Africa. Whether it "
     "is a single pallet or a full project-cargo convoy, our fleet is sized and scheduled to carry "
     "it — on a route we already know.",
     ["Full truckload (FTL) haulage", "Flatbed &amp; container trailers",
      "Project &amp; oversized cargo", "Dedicated contract routes for regular shippers"]),
    ("02", "Cross-border &amp; port haulage",
     "Scheduled runs from the ports of Mombasa and Dar es Salaam into Kigali, with customs clearing "
     "and documentation handled end to end — and onward transport into the DRC and every province "
     "of Rwanda.",
     ["Mombasa Port → Kigali (~1,730 km)", "Dar es Salaam → Kigali (~1,600 km)",
      "Customs clearing &amp; border documentation", "Kigali → DRC onward transport"]),
    ("03", "Abroad goods storage",
     "Self-storage for cargo waiting on a sailing, at competitive and transparent rates — so your "
     "goods are ready to move the moment a truck is scheduled.",
     ["Short &amp; long-term overseas storage", "Coordinated pickup &amp; consolidation",
      "Transparent, competitive rates", "Insurance-ready handling &amp; documentation"]),
    ("04", "Delivery &amp; warehousing",
     "More than storage. Our distribution warehouse is a full-service fulfilment solution, keeping "
     "stock ready for dispatch and getting it to the last mile without delay.",
     ["Distribution warehousing", "Last-mile delivery", "Inventory-ready storage",
      "Nationwide dispatch — Northern, Southern &amp; Eastern provinces"]),
]

PROCESS = [
    ("01", "Request", "Tell us the cargo, the route and the timeline — by phone, email or the form on this site."),
    ("02", "Plan", "We match the load to the right truck and trailer and confirm clearing requirements at each border."),
    ("03", "Haul &amp; clear", "Your cargo runs the corridor with one team handling transport and customs together."),
    ("04", "Deliver", "Freight lands at the warehouse, province or border point — confirmed, on schedule."),
]

services_body = phero(
    "Services", "What we do",
    "Four ways<br>we carry it.",
    "From a single pallet to project cargo, port clearance to the last mile — handled by a fleet "
    "of 100 trucks and 102 trailers."
) + """

<section class="bay ink" style="padding-top:var(--bay-s)">
  <div class="wrap">
""" + "\n".join("""    <div class="svcblk rise">
      <div class="svcblk__n">{n}</div>
      <div>
        <h2 class="h h2 svcblk__t">{t}</h2>
        <p class="svcblk__d">{d}</p>
        <ul class="svcblk__ul">
{items}
        </ul>
      </div>
    </div>""".format(n=n, t=t, d=d,
                     items="\n".join("          <li>{}</li>".format(i) for i in items))
                for n, t, d, items in SERVICES) + """
  </div>
</section>

<section class="bay pap">
  <div class="wrap">
    <div class="kick fade">How it works</div>
    <h2 class="h h2 rv" style="margin-top:22px">Request to delivery.</h2>
    <div class="trio" style="grid-template-columns:repeat(4,1fr)">
""" + "\n".join("""      <div class="trio__c rise">
        <div class="trio__tag">{n}</div>
        <div class="h h3 trio__n">{t}</div>
        <p class="trio__a">{d}</p>
      </div>""".format(n=n, t=t, d=d) for n, t, d in PROCESS) + """
    </div>
  </div>
</section>

""" + cta("Ready to book a haul?")


# ══════════════════════════════════════════════════════════════════ FLEET ══
FLEET_STATS = """
    <div class="num" style="margin-top:var(--gap-h)">
      <div class="num__c rise"><div class="num__v"><span data-count="100">0</span></div><div class="num__l">Tractor units</div></div>
      <div class="num__c rise"><div class="num__v"><span data-count="102">0</span></div><div class="num__l">Trailers</div></div>
      <div class="num__c rise"><div class="num__v"><span data-count="10">0</span><sup>+</sup></div><div class="num__l">New units per year</div></div>
      <div class="num__c rise"><div class="num__v"><span data-count="2">0</span></div><div class="num__l">Trailer types</div></div>
    </div>"""

GALLERY = [
    ("g8", "hero-highway-03.webp", "Martin Logistics truck on the corridor at sunset", "On the corridor — golden hour"),
    ("g4", "truck-front-livery.webp", "Sinotruk HOWO TX tractor unit, front view", "Sinotruk HOWO TX — front"),
    ("g4", "truck-side-twyford.webp", "Container trailer in partner livery", "Contract haulage — branded cargo"),
    ("g4", "truck-container-studio.webp", "Tractor unit hauling a shipping container", "Container chassis"),
    ("g4", "truck-chassis-studio.webp", "Tractor unit and flatbed trailer", "Tri-axle flatbed"),
    ("g6", "highway-sunset-a.webp", "Truck hauling a yellow container at sunset", "Mombasa corridor"),
    ("g6", "highway-sunset-b.webp", "Truck at sunrise on the highway", "Dar es Salaam run — sunrise"),
]

fleet_body = phero(
    "Fleet", "The fleet",
    "100 trucks.<br>102 trailers.",
    "Tractor units, container chassis and flatbeds — maintained in our own yard and scheduled "
    "daily across the Mombasa – Dar es Salaam – Kigali – DRC corridor.",
    FLEET_STATS
) + """

<section class="bay pap">
  <div class="wrap">
    <div class="kick fade">In the yard</div>
    <h2 class="h h2 rv" style="margin-top:22px">A closer look.</h2>
    <div class="gal">
""" + "\n".join("""      <figure class="{c} rise">
        <img src="assets/img/{f}" alt="{a}">
        <figcaption>{cap}</figcaption>
      </figure>""".format(c=c, f=f, a=a, cap=cap) for c, f, a, cap in GALLERY) + """
    </div>
  </div>
</section>

<section class="bay ink">
  <div class="wrap">
    <div class="kick fade">Built for the corridor</div>
    <h2 class="h h2 rv" style="margin-top:22px">Two trailer types.<br>One standard of care.</h2>
    <div class="duo">
      <div class="duo__c rise">
        <div class="duo__l">Flatbed trailers</div>
        <p class="duo__t">Tri-axle flatbeds for building materials, tiles, retreading stock and general cargo that does not need a box — loaded and lashed for the long haul from the coast.</p>
      </div>
      <div class="duo__c rise">
        <div class="duo__l">Container chassis</div>
        <p class="duo__t">Skeletal trailers built to carry 20ft and 40ft ISO containers straight off the vessel at Mombasa or Dar es Salaam, through customs, and into the yard at Kigali.</p>
      </div>
    </div>
  </div>
</section>

""" + cta("Need a truck on the road?")


# ═══════════════════════════════════════════════════════════════════ NEWS ══
NEWS = [
    ("Partnerships", "2020 — Ongoing", "Working alongside Bolloré, JBL and Simba Cargo",
     "Standing agreements for transportation, clearing and warehousing with established regional operators keep freight moving without delay.",
     "truck-side-twyford.webp", "Branded trailer for a partner shipment"),
    ("Network", "Ongoing", "One desk now clears cargo at three ports",
     "Streamlined customs handling across Mombasa, Dar es Salaam and Kigali cuts turnaround time for cross-border loads.",
     "highway-sunset-b.webp", "Truck on the Mombasa corridor at sunrise"),
    ("Milestone", "2025", "From 15 trucks to 100: a decade on the road",
     "What began in 2015 as an in-house haulage arm for Martin Hardware's own imports is now a 100-truck, 102-trailer regional operation.",
     "truck-front-livery.webp", "Martin Logistics tractor unit, front view"),
    ("Group", "2015", "Martin Hardware reaches 60% of Rwanda's tile market",
     "A partnership with Keda Kenya, Tanzania and The Africa Import &amp; Export Ltd — and a growing in-house fleet to move it all.",
     "truck-side-twyford-02.webp", "Twyford branded trailer, side profile"),
    ("Vision", "Ongoing", "Building toward Rwanda's top three operators",
     "Every new truck, corridor and partnership moves Martin Logistics closer to a standing commitment: ranking among the country's top three transport companies.",
     "truck-container-studio.webp", "Tractor unit hauling a shipping container"),
    ("Operations", "Ongoing", "Raw material on the move for tyre retreading",
     "Alongside freight for partners, the fleet keeps Martin Hardware's tyre-retreading department stocked — closing the loop between logistics and manufacturing.",
     "truck-front-02.webp", "Tractor unit cab detail"),
]

news_body = phero(
    "News", "Latest",
    "News from<br>the yard.",
    "Fleet growth, partnerships and network updates from Martin Logistics."
) + """

<section class="bay ink" style="padding-top:var(--bay-s)">
  <div class="wrap">
    <div class="split2 rise" style="align-items:center; padding-bottom:var(--gap-h); border-bottom:1px solid var(--rule-ink)">
      <div class="jrn__m" style="aspect-ratio:16/11">
        <span class="jrn__cat">Fleet</span>
        <img src="assets/img/truck-tractor-only.webp" alt="New tractor unit joining the fleet">
      </div>
      <div>
        <div class="jrn__dt">2025 — Featured</div>
        <h2 class="h h2" style="margin-top:14px">Ten new trucks and trailers join the fleet this year</h2>
        <p class="lede" style="margin-top:16px">
          Since committing to annual fleet growth, Martin Logistics adds ten trucks and ten trailers
          a year — a standing investment that keeps pace with contract volumes across the Mombasa,
          Dar es Salaam and Kigali corridor.
        </p>
        <a href="contact.html" class="btn btn--line" style="margin-top:24px"><span>Talk to us</span>""" + ARR + """</a>
      </div>
    </div>

    <div class="jrn">
""" + "\n".join("""      <article class="jrn__c rise">
        <div class="jrn__m">
          <span class="jrn__cat">{cat}</span>
          <img src="assets/img/{img}" alt="{alt}">
        </div>
        <div class="jrn__b">
          <div class="jrn__dt">{date}</div>
          <h3 class="h h3 jrn__t">{title}</h3>
          <p class="jrn__x">{ex}</p>
        </div>
      </article>""".format(cat=cat, date=date, title=title, ex=ex, img=img, alt=alt)
                for cat, date, title, ex, img, alt in NEWS) + """
    </div>
  </div>
</section>

""" + cta("Want to work with us?")


# ════════════════════════════════════════════════════════════════ CONTACT ══
contact_body = phero(
    "Contact", "Get in touch",
    "Got freight?<br>Let's talk.",
    "Tell us what needs to move, and where. We'll come back with a route and a price."
) + """

<section class="bay ink" style="padding-top:var(--bay-s)">
  <div class="wrap">
    <div class="split2">
      <div class="rise">
        <div class="kick">Request a quote</div>
        <h2 class="h h3" style="margin-top:16px">Send the details.</h2>
        <form class="form" id="quoteForm" style="margin-top:var(--gap-h)">
          <div class="fld"><label for="fName">Full name</label><input type="text" id="fName" required placeholder="Your name"></div>
          <div class="fld"><label for="fEmail">Email</label><input type="email" id="fEmail" required placeholder="you@company.com"></div>
          <div class="fld"><label for="fPhone">Phone</label><input type="tel" id="fPhone" placeholder="+250 …"></div>
          <div class="fld"><label for="fRoute">Route</label><input type="text" id="fRoute" placeholder="e.g. Mombasa Port → Kigali"></div>
          <div class="fld"><label for="fMsg">Cargo &amp; message</label><textarea id="fMsg" required placeholder="Cargo type, volume and preferred timeline"></textarea></div>
          <button type="submit" class="btn btn--fill"><span>Send request</span>""" + ARR + """</button>
          <p id="formNote" class="tag" style="margin-top:16px; display:none">Opening your email client…</p>
        </form>
      </div>

      <div class="rise">
        <div class="kick">Reach us directly</div>
        <h2 class="h h3" style="margin-top:16px">Head office.</h2>
        <div class="cinfo">
          <div class="cinfo__i"><div class="cinfo__l">Address</div><div class="cinfo__v">KK 13 Ave, Kigali, Rwanda<br>Gasabo District — Free Zone</div></div>
          <div class="cinfo__i"><div class="cinfo__l">Phone</div><div class="cinfo__v"><a href="tel:+250780898115">+250 780 898 115</a><br><a href="tel:+250787460120">+250 787 460 120</a></div></div>
          <div class="cinfo__i"><div class="cinfo__l">Email</div><div class="cinfo__v"><a href="mailto:info@martinhardware.rw">info@martinhardware.rw</a></div></div>
          <div class="cinfo__i"><div class="cinfo__l">Hours</div><div class="cinfo__v">Monday – Saturday, 7:00 – 19:00</div></div>
          <div class="cinfo__i"><div class="cinfo__l">Branches</div><div class="cinfo__v">Gisozi &amp; Kimironko, Kigali</div></div>
        </div>
      </div>
    </div>

    <div class="map fade">
      <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=29.98%2C-1.99%2C30.15%2C-1.90&amp;layer=mapnik&amp;marker=-1.9441%2C30.0619"
              loading="lazy" title="Martin Logistics — Kigali, Rwanda"></iframe>
    </div>
  </div>
</section>"""

CONTACT_JS = """<script>
  var form = document.getElementById('quoteForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (id) { return document.getElementById(id).value; };
      var body = 'Name: ' + v('fName') + '\\nEmail: ' + v('fEmail') +
                 '\\nPhone: ' + v('fPhone') + '\\nRoute: ' + v('fRoute') +
                 '\\n\\n' + v('fMsg');
      document.getElementById('formNote').style.display = 'block';
      window.location.href = 'mailto:info@martinhardware.rw?subject=' +
        encodeURIComponent('Quote request — ' + v('fName')) +
        '&body=' + encodeURIComponent(body);
    });
  }
</script>"""


page("about.html", "About — Martin Logistics",
     "From 15 trucks in 2015 to 100 trucks and 102 trailers today — the story of Martin Logistics, the transport division of Martin Hardware Ltd.",
     "about.html", about_body)

page("services.html", "Services — Martin Logistics",
     "Goods transportation, cross-border and port haulage, abroad goods storage, and delivery and warehousing across Rwanda, the DRC and East Africa.",
     "services.html", services_body)

page("fleet.html", "Fleet — Martin Logistics",
     "100 trucks and 102 trailers — tractor units, container chassis and flatbeds moving freight across Rwanda, the DRC and East Africa.",
     "fleet.html", fleet_body)

page("news.html", "News — Martin Logistics",
     "Fleet growth, partnerships and network updates from Martin Logistics in Kigali, Rwanda.",
     "news.html", news_body)

page("contact.html", "Contact — Martin Logistics",
     "Request a quote from Martin Logistics — KK 13 Ave, Kigali, Rwanda. Phone +250 780 898 115.",
     "contact.html", contact_body, CONTACT_JS)

print("done")
