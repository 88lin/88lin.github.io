// freembook
// F94B68280BF2954B2251BEAB549D13028D3B83DF||CBAD8D45

const data = data1.concat(
  data2,
  data3,
  data4,
  data5,
  data6,
  data7,
  data8,
  data9,
  data10,
  data11,
  data12,
  data13,
  data14,
  data15,
  data16,
  data17,
  data18,
  data19,
  data20,
  data21
);

const fuse_general = new Fuse(data, {
  minMatchCharLength: 2,
  includeScore: true,
  keys: [
    {
      name: "name",
      weight: 6,
    },
    {
      name: "author",
      weight: 2,
    },
    {
      name: "publisher",
      weight: 2,
    },
    {
      name: "identifier",
      weight: 2,
    },
    {
      name: "intro",
      weight: 1,
    },
  ],
});

const fuse_name = new Fuse(data, {
  minMatchCharLength: 2,
  includeScore: true,
  keys: ["name"],
});

const fuse_author = new Fuse(data, {
  minMatchCharLength: 2,
  includeScore: true,
  keys: ["author"],
});

const fuse_intro = new Fuse(data, {
  includeScore: true,
  minMatchCharLength: 2,
  keys: ["intro"],
});

const fuse_publisher = new Fuse(data, {
  minMatchCharLength: 2,
  includeScore: true,
  keys: ["publisher"],
});

const fuse_identifier = new Fuse(data, {
  minMatchCharLength: 2,
  threshold: 0.35,
  includeScore: true,
  keys: ["identifier"],
});

const fuses = [
  fuse_general,
  fuse_name,
  fuse_author,
  fuse_publisher,
  fuse_intro,
  fuse_identifier,
];

var loadindex = 0;
var old_loadindex;
var gen_div;
var gen_temp;
var result;
var select_box;
var number_load = 15;
var resultnumber1;
var resultnumber2;
var loadmore;
var section;
var currentpos;
var keyword;
var gen_down_ver;
var gen_down_single;
var gen_down_a;
window.onload = function () {
  loadmore = document.getElementsByClassName("loadmore")[0];
  resultnumber1 = document.getElementsByClassName("result number")[0];
  resultnumber2 = document.getElementsByClassName("result number")[1];
};

function search_keyword() {
  loadindex = 0;
  clearcontent();
  var d = new Date();
  var o = d.getTime();
  keyword = document.getElementById("search").value;
  if (keyword === "") {
    resultnumber1.innerText = "";
    resultnumber2.innerText = "";
    loadmore.style.display = "none";
    return;
  }
  // search!
  result = getFuse().search(keyword);
  var d = new Date();
  var n = d.getTime();
  console.log(n - o, " miliseconds");
  loadresults();
}

function getFuse() {
  select_box = document.getElementsByTagName("select")[0];
  return fuses[parseInt(select_box.value)];
}

function loadresults() {
  old_loadindex = loadindex;
  if (loadindex + number_load < result.length) {
    loadindex = loadindex + number_load;
    loadmore.style.display = "block";
  } else {
    loadindex = result.length;
    loadmore.style.display = "none";
  }
  section = document.createElement("section");
  section.classList.add("result");
  section.classList.add("container");
  for (var i = old_loadindex; i < loadindex; i++) {
    gen_div = document.createElement("div");
    gen_div.classList.add("result");
    gen_div.classList.add("single");
    if (result[i].item.name != undefined) {
      gen_temp = document.createElement("div");
      gen_temp.classList.add("bookname");
      gen_temp.innerText = result[i].item.name;
      gen_div.appendChild(gen_temp);
    }
    if (result[i].item.author != undefined) {
      gen_temp = document.createElement("div");
      gen_temp.classList.add("author");
      gen_temp.innerText = result[i].item.author;
      gen_div.appendChild(gen_temp);
    }
    if (result[i].item.publisher != undefined) {
      gen_temp = document.createElement("div");
      gen_temp.classList.add("publisher");
      gen_temp.innerText = result[i].item.publisher;
      gen_div.appendChild(gen_temp);
    }
    if (result[i].item.tg_ids != undefined) {
      gen_down_ver = document.createElement("div");
      gen_down_ver.classList.add("down_all");
      for (var j = 0; j < result[i].item.tg_ids.length; j++) {
        gen_temp = document.createElement("div");
        gen_temp.classList.add("down_link");
        if (!isNaN(result[i].item.tg_ids[j][0])) {
          // photo_id
          gen_temp.appendChild(
            gen_link(result[i].item.tg_ids[j][0], "down_link_photo", "封面图")
          );
        }
        if (!isNaN(result[i].item.tg_ids[j][1])) {
          // mobi_id
          gen_temp.appendChild(
            gen_link(result[i].item.tg_ids[j][1], "down_link_single", "MOBI")
          );
        }
        if (!isNaN(result[i].item.tg_ids[j][2])) {
          // epub_id
          gen_temp.appendChild(
            gen_link(result[i].item.tg_ids[j][2], "down_link_single", "EPUB")
          );
        }
        if (!isNaN(result[i].item.tg_ids[j][3])) {
          // azw3_id
          gen_temp.appendChild(
            gen_link(result[i].item.tg_ids[j][3], "down_link_single", "AZW3")
          );
        }
        if (!isNaN(result[i].item.tg_ids[j][4])) {
          // pdf_id
          gen_temp.appendChild(
            gen_link(result[i].item.tg_ids[j][4], "down_link_single", "PDF")
          );
        }
        gen_down_ver.appendChild(gen_temp);
      }
    }
    gen_div.appendChild(gen_down_ver);
    if (result[i].item.intro != undefined) {
      gen_temp = document.createElement("div");
      gen_temp.classList.add("intro");
      gen_temp.innerText = result[i].item.intro;
      gen_div.appendChild(gen_temp);
    }
    if (result[i].item.pubdate != undefined) {
      gen_temp = document.createElement("div");
      gen_temp.classList.add("pubdate");
      gen_temp.innerText = result[i].item.pubdate;
      gen_div.appendChild(gen_temp);
    }
    if (result[i].item.identifier != undefined) {
      gen_temp = document.createElement("div");
      gen_temp.classList.add("identifier");
      gen_temp.innerText = result[i].item.identifier;
      gen_div.appendChild(gen_temp);
    }
    section.appendChild(gen_div);
  }
  currentpos = document.body.scrollTop + document.documentElement.scrollTop;
  document.getElementsByClassName("allresult")[0].appendChild(section);
  resultnumber1.innerText =
    "找到 " + result.length + " 本书，已加载 " + loadindex + " 本书。";
  resultnumber2.innerText =
    "找到 " + result.length + " 本书，已加载 " + loadindex + " 本书。";

  window.scrollTo(0, currentpos);
  highlightKeyword(section);
}

function gen_link(tg_id, classname, atagText) {
  gen_down_single = document.createElement("span");
  gen_down_single.classList.add(classname);
  gen_down_a = document.createElement("a");
  gen_down_a.setAttribute(
    "href",
    "https://t.me/freembook_channel/" + parseInt(tg_id)
  );
  gen_down_a.setAttribute("target", "_blank");
  gen_down_a.innerText = atagText;
  gen_down_single.appendChild(gen_down_a);
  return gen_down_single;
}

function highlightKeyword(node) {
  var transformString = keyword.replace(/[.[*?+^$|()/]|\]|\\/g, "\\$&");
  var pattern = new RegExp(transformString, "i");
  if (node.nodeType === 3) {
    var matchResult = node.data.match(pattern);
    if (matchResult) {
      var highlightEl = document.createElement("span");
      highlightEl.dataset.highlight = "yes";
      var matchNode = node.splitText(matchResult.index);
      matchNode.splitText(matchResult[0].length);
      var highlightTextNode = document.createTextNode(matchNode.data);

      highlightEl.appendChild(highlightTextNode);

      matchNode.parentNode.replaceChild(highlightEl, matchNode);
    }
  } else if (
    node.nodeType === 1 &&
    !/script|style/.test(node.tagName.toLowerCase()) &&
    node.dataset.highlight !== "yes"
  ) {
    var childNodes = node.childNodes;
    for (var i = 0; i < childNodes.length; i++) {
      highlightKeyword(childNodes[i], pattern);
    }
  }
}

function clearcontent() {
  var temp = document.querySelectorAll(".result.container");
  for (var i = 0; i < temp.length; i++) {
    document.getElementsByClassName("allresult")[0].removeChild(temp[i]);
  }
}

