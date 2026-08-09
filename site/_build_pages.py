# -*- coding: utf-8 -*-
"""Stamp the interior pages from one shared shell.

Keeps nav / footer / script tags identical everywhere. Output is plain static
HTML — there is no build step at serve time, this just avoids hand-maintaining
six copies of the chrome.
"""
import io
import os

HERE = os.path.dirname(os.path.abspath(__file__))

NAV_ITEMS = [
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
    " font-family='Arial Black' font-size='62' fill='%23EDD836' text-anchor='middle'%3EM"
    "%3C/text%3E%3C/svg%3E"
)

ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'
         '<path d="M7 17L17 7M17 7H8M17 7V16"/></svg>')


def nav(active):
    links = "\n".join(
        '      <a href="{}"{}>{}</a>'.format(h, ' class="on"' if h == active else "", label)
        for h, label in NAV_ITEMS
    )
    sheet = "\n".join('    <a href="{}">{}</a>'.format(h, label) for h, label in NAV_ITEMS)
    return """<header class="nav solid" id="nav">
  <div class="nav__in">
    <a href="index.html" class="nav__logo" aria-label="Martin Logistics — home">
      <img src="assets/img/logo-word.png" alt="Martin Logistics">
    </a>
    <nav class="nav__links">
{links}
    </nav>
    <div class="nav__end">
      <a href="contact.html" class="btn btn--fill btn--sm">
        <span>Request a quote</span>
        {arrow}
      </a>
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
</div>""".format(links=links, sheet=sheet, arrow=ARROW)


CTA = """<section class="bay cta">
  <img class="cta__truck" src="assets/img/truck-side-twyford-02-cut.webp" alt="" data-par="-8">
  <div class="wrap cta__in">
    <h2 class="cta__t rv">{head}</h2>
    <div class="cta__acts">
      <a href="contact.html" class="btn btn--fill">
        <span>Request a quote</span>
        {arrow}
      </a>
      <a href="tel:+250780898115" class="btn btn--line"><span>+250 780 898 115</span></a>
    </div>
  </div>
</section>"""


FOOTER = """<footer class="ft">
  <div class="wrap">
    <div class="ft__top">
      <div>
        <a href="index.html" class="ft__logo"><img src="assets/img/logo-lockup.png" alt="Martin Logistics"></a>
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
          <li><a href="services.html">Goods Transportation</a></li>
          <li><a href="services.html">Cross-Border &amp; Port</a></li>
          <li><a href="services.html">Abroad Goods Storage</a></li>
          <li><a href="services.html">Delivery &amp; Warehousing</a></li>
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
      <span>© <span id="yr">2026</span> Martin Logistics — A Department of Martin Hardware Ltd</span>
      <div class="ft__soc"><a href="#">Facebook</a><a href="#">LinkedIn</a><a href="#">X</a></div>
    </div>
  </div>
</footer>"""


SCRIPTS = """<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="js/site.js"></script>"""


def page(filename, title, desc, active, body, extra_scripts=""):
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

{nav}

{body}

{footer}

{scripts}
{extra}
</body>
</html>
""".format(title=title, desc=desc, fav=FAVICON, nav=nav(active),
           body=body, footer=FOOTER, scripts=SCRIPTS, extra=extra_scripts)
    with io.open(os.path.join(HERE, filename), "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", filename, len(html), "bytes")


# ══════════════════════════════════════════════════════════════ ABOUT ══════
about_body = """<section class="phero ink">
  <img class="phero__ghost" src="assets/img/truck-front-livery-cut.webp" alt="" aria-hidden="true">
  <div class="wrap">
    <div class="phero__crumb fade"><a href="index.html">Index</a> — About</div>
    <div class="kick fade">Est. 2015 · Gasabo, Kigali</div>
    <h1 class="disp d1 phero__t rv">Twelve years.<br>One relentless yard.</h1>
    <p class="lede phero__s rise">
      Martin Logistics began as a way to move our own hardware stock. It grew into a
      transport operation carrying freight for some of East Africa's biggest names —
      built truck by truck, year on year, out of Kigali.
    </p>
  </div>
</section>

<section class="bay pap">
  <div class="wrap">
    <div class="kick fade">The story</div>
    <h2 class="disp d2 rv" style="margin-top:26px; max-width:16ch;">Fifteen trucks became two hundred and two units.</h2>

    <div style="margin-top:var(--gap-h)">
      <div class="tl__row rise">
        <div class="tl__y">2012</div>
        <div>
          <h3 class="tl__t">Foundation</h3>
          <p class="tl__d">Madam Cecile Uwiduhaye founds Martin Hardware Ltd, importing wall tiles, floor tiles, house glass and household products into Rwanda. The head office opens in Gasabo District, with branches following in Gisozi and Kimironko.</p>
        </div>
      </div>
      <div class="tl__row rise">
        <div class="tl__y">2015</div>
        <div>
          <h3 class="tl__t">The first fleet</h3>
          <p class="tl__d">With fifteen trucks, the company begins hauling its own tile and glass imports rather than relying on third-party carriers. The same year, a partnership with Keda Kenya, Tanzania and The Africa Import &amp; Export Ltd takes Martin Hardware to roughly 60% of Rwanda's tile market.</p>
        </div>
      </div>
      <div class="tl__row rise">
        <div class="tl__y">2020</div>
        <div>
          <h3 class="tl__t">Regional partnerships</h3>
          <p class="tl__d">Agreements are signed with Bolloré Transport &amp; Logistics Rwanda, JBL Logistics Group, Simba Cargo, R&amp;M Logistics, Intelgraca, YITIYAN, OLIU Logistics, AGANZE Group, Kivu Choice and Kigali Plastic — covering transportation, clearing, shipping and warehousing.</p>
        </div>
      </div>
      <div class="tl__row rise">
        <div class="tl__y">2025</div>
        <div>
          <h3 class="tl__t">Scaling up</h3>
          <p class="tl__d">The fleet reaches 100 trucks and 102 trailers, with a standing commitment to add ten more of each every year — specialising in the Dar es Salaam–Kigali, Mombasa–Kigali and Kigali–DRC corridors, plus raw material for the group's tyre-retreading line.</p>
        </div>
      </div>
      <div class="tl__row rise">
        <div class="tl__y">Today</div>
        <div>
          <h3 class="tl__t">Regional reach</h3>
          <p class="tl__d">Freight moves daily between the ports of Mombasa and Dar es Salaam, through Kigali, and onward into the DRC and every province of Rwanda — with one accountable team handling transport, clearing and delivery end to end.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="convoy" id="convoy">
  <div class="convoy__road"></div>
  <img class="convoy__truck" src="assets/img/truck-tractor-only-cut.webp" alt="" aria-hidden="true">
  <div class="convoy__cap">Kigali yard — <b>outbound</b></div>
  <div class="convoy__km">EST. 2015</div>
</section>

<section class="bay ink">
  <div class="wrap">
    <div class="kick fade">Vision &amp; mission</div>
    <h2 class="disp d2 rv" style="margin-top:26px;">Where we're headed.</h2>
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
    <h2 class="disp d2 rv" style="margin-top:26px;">Founder-led, from day one.</h2>
    <div class="split2" style="margin-top:var(--gap-h); align-items:start;">
      <blockquote class="disp d3" style="text-transform:none; letter-spacing:0;">
        &ldquo;Improving quality of life with a unified approach.&rdquo;
      </blockquote>
      <div>
        <div class="tag">Madam Cecile Uwiduhaye — CEO &amp; Founder</div>
        <p class="lede" style="margin-top:18px;">
          With more than twelve years in business, Madam Uwiduhaye started Martin Hardware Ltd
          in 2012 and has personally steered its growth from a Kigali tile importer into a
          hardware and logistics group running a hundred-truck fleet.
        </p>
        <p class="lede" style="margin-top:16px;">
          The logistics division carries that same standard: own the trucks, own the schedule,
          answer for the delivery.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="bay ink">
  <div class="wrap">
    <div class="kick fade">Where we're based</div>
    <h2 class="disp d2 rv" style="margin-top:26px;">Head office &amp; branches.</h2>
    <div class="trio">
      <div class="trio__c rise">
        <div class="trio__tag">Head office</div>
        <div class="trio__n">Gasabo</div>
        <p class="trio__a">KK 13 Ave, Kigali, Rwanda<br>Free Zone</p>
      </div>
      <div class="trio__c rise">
        <div class="trio__tag">Branch</div>
        <div class="trio__n">Gisozi</div>
        <p class="trio__a">Tiles, glass &amp; house sanitations<br>Kigali, Rwanda</p>
      </div>
      <div class="trio__c rise">
        <div class="trio__tag">Branch</div>
        <div class="trio__n">Kimironko</div>
        <p class="trio__a">Tiles, glass &amp; house sanitations<br>Kigali, Rwanda</p>
      </div>
    </div>
  </div>
</section>

""" + CTA.format(head="See the fleet that moves it.", arrow=ARROW)


# ═══════════════════════════════════════════════════════════ SERVICES ══════
def svcblk(n, title, desc, items):
    lis = "\n".join("          <li>{}</li>".format(i) for i in items)
    return """      <div class="svcblk rise">
        <div class="svcblk__n">{n}</div>
        <div>
          <h2 class="svcblk__t">{title}</h2>
          <p class="svcblk__d">{desc}</p>
          <ul class="svcblk__ul">
{lis}
          </ul>
        </div>
      </div>""".format(n=n, title=title, desc=desc, lis=lis)


services_body = """<section class="phero ink">
  <img class="phero__ghost" src="assets/img/truck-container-studio-cut.webp" alt="" aria-hidden="true">
  <div class="wrap">
    <div class="phero__crumb fade"><a href="index.html">Index</a> — Services</div>
    <div class="kick fade">What we do</div>
    <h1 class="disp d1 phero__t rv">Four ways<br>we carry it.</h1>
    <p class="lede phero__s rise">
      From a single pallet to project cargo, port clearance to the last mile —
      handled by a fleet of 100 trucks and 102 trailers.
    </p>
  </div>
</section>

<section class="bay ink">
  <div class="wrap">
""" + "\n\n".join([
    svcblk("01", "Logistics &amp; Goods Transportation",
           "Full-load and part-load freight haulage across Rwanda, the DRC and East Africa. Whether it is a single pallet or a full project-cargo convoy, our fleet is sized and scheduled to carry it — on a route we already know.",
           ["Full truckload (FTL) haulage",
            "Flatbed &amp; container trailers",
            "Project &amp; oversized cargo",
            "Dedicated contract routes for regular shippers"]),
    svcblk("02", "Cross-Border &amp; Port Haulage",
           "Scheduled runs from the ports of Mombasa and Dar es Salaam into Kigali, with customs clearing and documentation handled end to end — and onward transport into the DRC and every province of Rwanda.",
           ["Mombasa Port → Kigali (~1,730 km)",
            "Dar es Salaam → Kigali (~1,600 km)",
            "Customs clearing &amp; border documentation",
            "Kigali → DRC onward transport"]),
    svcblk("03", "Abroad Goods Storage",
           "Self-storage for cargo waiting on a sailing, at competitive and transparent rates — so your goods are ready to move the moment a truck is scheduled.",
           ["Short &amp; long-term overseas storage",
            "Coordinated pickup &amp; consolidation",
            "Transparent, competitive rates",
            "Insurance-ready handling &amp; documentation"]),
    svcblk("04", "Delivery &amp; Warehousing",
           "More than storage. Our distribution warehouse is a full-service fulfilment solution, keeping stock ready for dispatch and getting it to the last mile without delay.",
           ["Distribution warehousing",
            "Last-mile delivery",
            "Inventory-ready storage",
            "Nationwide dispatch — Northern, Southern &amp; Eastern provinces"]),
]) + """
  </div>
</section>

<section class="convoy" id="convoy">
  <div class="convoy__road"></div>
  <img class="convoy__truck" src="assets/img/truck-side-twyford-02-cut.webp" alt="" aria-hidden="true">
  <div class="convoy__cap">Contract haulage — <b>your livery</b></div>
  <div class="convoy__km">FTL</div>
</section>

<section class="bay pap">
  <div class="wrap">
    <div class="kick fade">How it works</div>
    <h2 class="disp d2 rv" style="margin-top:26px;">Request to delivery.</h2>
    <div class="trio" style="grid-template-columns:repeat(4,1fr); background:var(--rule-pap);">
      <div class="trio__c rise" style="background:var(--paper)">
        <div class="trio__tag" style="color:var(--red)">01</div>
        <div class="trio__n">Request</div>
        <p class="trio__a" style="color:var(--on-pap-2)">Tell us the cargo, the route and the timeline — by phone, email or the form on this site.</p>
      </div>
      <div class="trio__c rise" style="background:var(--paper)">
        <div class="trio__tag" style="color:var(--red)">02</div>
        <div class="trio__n">Plan</div>
        <p class="trio__a" style="color:var(--on-pap-2)">We match the load to the right truck and trailer and confirm clearing requirements at each border.</p>
      </div>
      <div class="trio__c rise" style="background:var(--paper)">
        <div class="trio__tag" style="color:var(--red)">03</div>
        <div class="trio__n">Haul &amp; clear</div>
        <p class="trio__a" style="color:var(--on-pap-2)">Your cargo runs the corridor with one team handling transport and customs together.</p>
      </div>
      <div class="trio__c rise" style="background:var(--paper)">
        <div class="trio__tag" style="color:var(--red)">04</div>
        <div class="trio__n">Deliver</div>
        <p class="trio__a" style="color:var(--on-pap-2)">Freight lands at the warehouse, province or border point — confirmed, on schedule.</p>
      </div>
    </div>
  </div>
</section>

""" + CTA.format(head="Ready to book a haul?", arrow=ARROW)


# ══════════════════════════════════════════════════════════════ FLEET ══════
fleet_body = """<section class="phero ink">
  <div class="wrap">
    <div class="phero__crumb fade"><a href="index.html">Index</a> — Fleet</div>
    <div class="kick fade">The fleet</div>
    <h1 class="disp d1 phero__t rv">100 trucks.<br>102 trailers.</h1>
    <p class="lede phero__s rise">
      Tractor units, container chassis and flatbeds — maintained in our own yard and
      scheduled daily across the Mombasa – Dar es Salaam – Kigali – DRC corridor.
    </p>

    <div class="num" style="margin-top:var(--gap-h)">
      <div class="num__c rise">
        <div class="num__v"><span data-count="100">0</span></div>
        <div class="num__l">Tractor units</div>
      </div>
      <div class="num__c rise">
        <div class="num__v"><span data-count="102">0</span></div>
        <div class="num__l">Trailers</div>
      </div>
      <div class="num__c rise">
        <div class="num__v"><span data-count="10">0</span><sup>+</sup></div>
        <div class="num__l">New units per year</div>
      </div>
      <div class="num__c rise">
        <div class="num__v"><span data-count="2">0</span></div>
        <div class="num__l">Trailer types</div>
      </div>
    </div>
  </div>
</section>

<section class="bay pap">
  <div class="wrap">
    <div class="kick fade">In the yard</div>
    <h2 class="disp d2 rv" style="margin-top:26px;">A closer look.</h2>

    <div class="gal">
      <figure class="g8 rise">
        <img src="assets/img/hero-highway-03.webp" alt="Martin Logistics truck on the corridor at sunset">
        <figcaption>On the corridor — golden hour</figcaption>
      </figure>
      <figure class="g4 rise">
        <img src="assets/img/truck-front-livery.webp" alt="Sinotruk HOWO TX tractor unit, front view">
        <figcaption>Sinotruk HOWO TX — front</figcaption>
      </figure>
      <figure class="g4 rise">
        <img src="assets/img/truck-side-twyford.webp" alt="Container trailer in partner livery">
        <figcaption>Contract haulage — branded cargo</figcaption>
      </figure>
      <figure class="g4 rise">
        <img src="assets/img/truck-container-studio.webp" alt="Tractor unit hauling a shipping container">
        <figcaption>Container chassis</figcaption>
      </figure>
      <figure class="g4 rise">
        <img src="assets/img/truck-chassis-studio.webp" alt="Tractor unit and flatbed trailer">
        <figcaption>Tri-axle flatbed</figcaption>
      </figure>
      <figure class="g6 rise">
        <img src="assets/img/highway-sunset-a.webp" alt="Martin Logistics truck hauling a yellow container">
        <figcaption>Mombasa corridor</figcaption>
      </figure>
      <figure class="g6 rise">
        <img src="assets/img/highway-sunset-b.webp" alt="Martin Logistics truck at sunrise">
        <figcaption>Dar es Salaam run — sunrise</figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="convoy" id="convoy">
  <div class="convoy__road"></div>
  <img class="convoy__truck" src="assets/img/truck-chassis-studio-cut.webp" alt="" aria-hidden="true">
  <div class="convoy__cap">Tri-axle flatbed — <b>loaded &amp; lashed</b></div>
  <div class="convoy__km">102</div>
</section>

<section class="bay ink">
  <div class="wrap">
    <div class="kick fade">Built for the corridor</div>
    <h2 class="disp d2 rv" style="margin-top:26px;">Two trailer types.<br>One standard of care.</h2>
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

""" + CTA.format(head="Need a truck on the road?", arrow=ARROW)


# ═══════════════════════════════════════════════════════════════ NEWS ══════
def jrn(cat, date, title, excerpt, img, alt):
    return """      <article class="jrn__c rise">
        <div class="jrn__m">
          <span class="jrn__cat">{cat}</span>
          <img src="{img}" alt="{alt}">
        </div>
        <div class="jrn__b">
          <div class="jrn__dt">{date}</div>
          <h3 class="jrn__t">{title}</h3>
          <p class="jrn__x">{excerpt}</p>
        </div>
      </article>""".format(cat=cat, date=date, title=title, excerpt=excerpt, img=img, alt=alt)


news_body = """<section class="phero ink">
  <div class="wrap">
    <div class="phero__crumb fade"><a href="index.html">Index</a> — News</div>
    <div class="kick fade">Latest</div>
    <h1 class="disp d1 phero__t rv">News from<br>the yard.</h1>
    <p class="lede phero__s rise">Fleet growth, partnerships and network updates from Martin Logistics.</p>
  </div>
</section>

<section class="bay ink" style="padding-top:0">
  <div class="wrap">
    <div class="split2 rise" style="align-items:center; padding-bottom:var(--gap-h); border-bottom:1px solid var(--rule-ink);">
      <div class="jrn__m" style="aspect-ratio:16/11">
        <span class="jrn__cat">Fleet</span>
        <img src="assets/img/truck-tractor-only.webp" alt="New tractor unit joining the Martin Logistics fleet">
      </div>
      <div>
        <div class="jrn__dt">2025 — Featured</div>
        <h2 class="disp d3" style="margin-top:16px;">Ten new trucks and trailers join the fleet this year</h2>
        <p class="lede" style="margin-top:18px;">
          Since committing to annual fleet growth, Martin Logistics adds ten trucks and ten
          trailers a year — a standing investment that keeps pace with contract volumes across
          the Mombasa, Dar es Salaam and Kigali corridor.
        </p>
        <a href="contact.html" class="btn btn--line" style="margin-top:28px">
          <span>Talk to us</span>
          {arrow}
        </a>
      </div>
    </div>

    <div class="jrn">
""".format(arrow=ARROW) + "\n\n".join([
    jrn("Partnerships", "2020 — Ongoing", "Working alongside Bolloré, JBL and Simba Cargo",
        "Standing agreements for transportation, clearing and warehousing with established regional operators keep freight moving without delay.",
        "assets/img/truck-side-twyford.webp", "Branded trailer for a partner shipment"),
    jrn("Network", "Ongoing", "One desk now clears cargo at three ports",
        "Streamlined customs handling across Mombasa, Dar es Salaam and Kigali cuts turnaround time for cross-border loads.",
        "assets/img/highway-sunset-b.webp", "Truck on the Mombasa to Kigali corridor at sunrise"),
    jrn("Milestone", "2025", "From 15 trucks to 100: a decade on the road",
        "What began in 2015 as an in-house haulage arm for Martin Hardware's own imports is now a 100-truck, 102-trailer regional operation.",
        "assets/img/truck-front-livery.webp", "Martin Logistics tractor unit, front view"),
    jrn("Group", "2015", "Martin Hardware reaches 60% of Rwanda's tile market",
        "A partnership with Keda Kenya, Tanzania and The Africa Import &amp; Export Ltd — and a growing in-house fleet to move it all.",
        "assets/img/truck-side-twyford-02.webp", "Twyford branded trailer, side profile"),
    jrn("Vision", "Ongoing", "Building toward Rwanda's top three operators",
        "Every new truck, corridor and partnership moves Martin Logistics closer to a standing commitment: ranking among the country's top three transport companies.",
        "assets/img/truck-container-studio.webp", "Tractor unit hauling a shipping container"),
    jrn("Operations", "Ongoing", "Raw material on the move for tyre retreading",
        "Alongside freight for partners, the fleet keeps Martin Hardware's tyre-retreading department stocked — closing the loop between logistics and manufacturing.",
        "assets/img/truck-front-02.webp", "Tractor unit cab detail"),
]) + """
    </div>
  </div>
</section>

""" + CTA.format(head="Want to work with us?", arrow=ARROW)


# ════════════════════════════════════════════════════════════ CONTACT ══════
contact_body = """<section class="phero ink">
  <img class="phero__ghost" src="assets/img/truck-front-02-cut.webp" alt="" aria-hidden="true">
  <div class="wrap">
    <div class="phero__crumb fade"><a href="index.html">Index</a> — Contact</div>
    <div class="kick fade">Get in touch</div>
    <h1 class="disp d1 phero__t rv">Got freight?<br>Let's talk.</h1>
    <p class="lede phero__s rise">Tell us what needs to move, and where. We'll come back with a route and a price.</p>
  </div>
</section>

<section class="bay ink" style="padding-top:var(--bay-s)">
  <div class="wrap">
    <div class="split2">
      <div class="rise">
        <div class="kick">Request a quote</div>
        <h2 class="disp d3" style="margin-top:18px;">Send the details.</h2>

        <form class="form" id="quoteForm" style="margin-top:var(--gap-h)">
          <div class="fld">
            <label for="fName">Full name</label>
            <input type="text" id="fName" name="name" required placeholder="Your name">
          </div>
          <div class="fld">
            <label for="fEmail">Email</label>
            <input type="email" id="fEmail" name="email" required placeholder="you@company.com">
          </div>
          <div class="fld">
            <label for="fPhone">Phone</label>
            <input type="tel" id="fPhone" name="phone" placeholder="+250 …">
          </div>
          <div class="fld">
            <label for="fRoute">Route</label>
            <input type="text" id="fRoute" name="route" placeholder="e.g. Mombasa Port → Kigali">
          </div>
          <div class="fld">
            <label for="fMsg">Cargo &amp; message</label>
            <textarea id="fMsg" name="message" required placeholder="Cargo type, volume and preferred timeline"></textarea>
          </div>
          <button type="submit" class="btn btn--fill">
            <span>Send request</span>
            {arrow}
          </button>
          <p id="formNote" class="tag" style="margin-top:18px; display:none;">Opening your email client…</p>
        </form>
      </div>

      <div class="rise">
        <div class="kick">Reach us directly</div>
        <h2 class="disp d3" style="margin-top:18px;">Head office.</h2>

        <div class="cinfo">
          <div class="cinfo__i">
            <div class="cinfo__l">Address</div>
            <div class="cinfo__v">KK 13 Ave, Kigali, Rwanda<br>Gasabo District — Free Zone</div>
          </div>
          <div class="cinfo__i">
            <div class="cinfo__l">Phone</div>
            <div class="cinfo__v"><a href="tel:+250780898115">+250 780 898 115</a><br><a href="tel:+250787460120">+250 787 460 120</a></div>
          </div>
          <div class="cinfo__i">
            <div class="cinfo__l">Email</div>
            <div class="cinfo__v"><a href="mailto:info@martinhardware.rw">info@martinhardware.rw</a></div>
          </div>
          <div class="cinfo__i">
            <div class="cinfo__l">Hours</div>
            <div class="cinfo__v">Monday – Saturday, 7:00 – 19:00</div>
          </div>
          <div class="cinfo__i">
            <div class="cinfo__l">Branches</div>
            <div class="cinfo__v">Gisozi &amp; Kimironko, Kigali</div>
          </div>
        </div>
      </div>
    </div>

    <div class="map fade">
      <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=29.98%2C-1.99%2C30.15%2C-1.90&amp;layer=mapnik&amp;marker=-1.9441%2C30.0619"
              loading="lazy" title="Martin Logistics — Kigali, Rwanda"></iframe>
    </div>
  </div>
</section>""".format(arrow=ARROW)

contact_script = """<script>
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
     "contact.html", contact_body, contact_script)

print("done")
