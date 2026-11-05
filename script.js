/* ==========================================================
   MOTOLEGEND V2
   Tienda frontend para clientes de TikTok / WhatsApp.
   Sin backend ni base de datos: localStorage + exportación.
========================================================== */

(() => {
    "use strict";

    /* ======================================================
       1. CONFIGURACION
       Cambia aquí el WhatsApp, la ciudad y los descuentos.
    ====================================================== */

    const CONFIG = {
        negocio: "MotoLegend",
        whatsapp: "59170000000", // formato internacional sin + ni espacios
        ciudad: "La Paz",
        locale: "es-BO",
        moneda: "BOB",
        maxPorPedido: 5,
        diasEntrega: 14,
        descuentos: {
            TIKTOK10: { pct: 10, vence: "2026-12-31" }
        }
    };

    const PRODUCTOS = [
        {
            id: "urban-150",
            codigo: "ML-URB",
            nombre: "Moto Urban 150",
            categoria: "Urbana",
            precio: 8900,
            stock: 6,
            descripcion: "Ágil, económica y perfecta para la ciudad.",
            imagen: "urban-150.jpg",
            alt: "Motocicleta Yamaha YBR 125 roja de perfil",
            emoji: "🛵",
            activo: true
        },
        {
            id: "city-125",
            codigo: "ML-CIT",
            nombre: "Scooter City 125",
            categoria: "Scooter",
            precio: 7500,
            stock: 5,
            descripcion: "Scooter automática para moverte sin esfuerzo.",
            imagen: "scooter-city-125.jpg",
            alt: "Scooter Honda PCX 150 marrón de perfil",
            emoji: "🛵",
            activo: true
        },
        {
            id: "scooter-sport-155",
            codigo: "ML-SCT",
            nombre: "Scooter Sport 155",
            categoria: "Scooter",
            precio: 11900,
            stock: 4,
            descripcion: "Diseño deportivo, automática y gran autonomía.",
            imagen: "scooter-sport-155.jpg",
            alt: "Scooter Yamaha NMAX 155 vista frontal",
            emoji: "🛵",
            activo: true
        },
        {
            id: "trail-200",
            codigo: "ML-TRA",
            nombre: "Moto Trail 200",
            categoria: "Aventura",
            precio: 12500,
            stock: 5,
            descripcion: "Preparada para caminos de tierra y aventuras.",
            imagen: "trail-200.jpg",
            alt: "Moto Yamaha XTZ 250 Tenere blanca y roja",
            emoji: "🏍️",
            activo: true
        },
        {
            id: "enduro-250",
            codigo: "ML-END",
            nombre: "Moto Enduro 250",
            categoria: "Enduro",
            precio: 15900,
            stock: 3,
            descripcion: "Suspensión reforzada para terrenos exigentes.",
            imagen: "enduro-250.jpg",
            alt: "Moto Honda Tornado negra de perfil",
            emoji: "🏍️",
            activo: true
        },
        {
            id: "sport-250",
            codigo: "ML-SPO",
            nombre: "Moto Sport 250",
            categoria: "Deportiva",
            precio: 17900,
            stock: 4,
            descripcion: "Diseño deportivo y gran potencia para la carretera.",
            imagen: "sport-250.jpg",
            alt: "Moto Honda CBR 250 RR roja de perfil",
            emoji: "🏍️",
            activo: true
        },
        {
            id: "naked-200",
            codigo: "ML-NAK",
            nombre: "Moto Naked 200",
            categoria: "Naked",
            precio: 14500,
            stock: 4,
            descripcion: "Estilo naked, posición cómoda y respuesta inmediata.",
            imagen: "naked-200.jpg",
            alt: "Moto Megelli naked roja y negra sobre fondo blanco",
            emoji: "🏍️",
            activo: true
        },
        {
            id: "cruiser-300",
            codigo: "ML-CRU",
            nombre: "Moto Cruiser 300",
            categoria: "Crucero",
            precio: 21900,
            stock: 3,
            descripcion: "Confort y presencia para viajes largos.",
            imagen: "cruiser-300.jpg",
            alt: "Moto Yamaha XV1600 Wild Star roja sobre fondo blanco",
            emoji: "🏍️",
            activo: true
        },
        {
            id: "adventure-400",
            codigo: "ML-ADV",
            nombre: "Moto Adventure 400",
            categoria: "Aventura",
            precio: 27900,
            stock: 2,
            descripcion: "Lista para viajar con equipaje y explorar sin límites.",
            imagen: "adventure-400.jpg",
            alt: "Moto KTM Adventure naranja con maletas laterales",
            emoji: "🏍️",
            activo: true
        }
    ];

    const VARIANTES = {
        estandar: { label: "Estándar", extra: 0 },
        casco: { label: "Con casco y guantes", extra: 500 },
        full: { label: "Full equipo", extra: 1200 }
    };


    /* ======================================================
       2. UTILIDADES
    ====================================================== */

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const formatoMoneda = new Intl.NumberFormat(CONFIG.locale, {
        style: "currency",
        currency: CONFIG.moneda,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    const money = (valor) => formatoMoneda.format(Number(valor) || 0);

    const cleanName = (valor) => String(valor || "").trim().replace(/\s+/g, " ");

    const plural = (cantidad, singular, plurales) =>
        Number(cantidad) === 1 ? singular : plurales;

    const normalizeText = (valor) =>
        String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();

    const productById = (id) => PRODUCTOS.find((p) => p.id === id);

    const localDateKey = (fecha = new Date()) => {
        const y = fecha.getFullYear();
        const m = String(fecha.getMonth() + 1).padStart(2, "0");
        const d = String(fecha.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const debounce = (fn, wait) => {
        let timer = null;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), wait);
        };
    };

    const download = (filename, content, type) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    };

    const waLink = (texto) =>
        `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;

    const formatPhone = (numero) => {
        const n = String(numero || "");
        return /^591\d{8}$/.test(n) ? `+591 ${n.slice(3)}` : n;
    };

    const normalizePhone = (raw) => {
        let n = String(raw || "").replace(/[\s().-]/g, "");
        if (n.startsWith("+")) n = n.slice(1);
        if (/^591[67]\d{7}$/.test(n)) n = n.slice(3);
        return /^[67]\d{7}$/.test(n) ? `591${n}` : n;
    };


    /* ======================================================
       3. ESTADO Y ALMACENAMIENTO LOCAL
    ====================================================== */

    const STORAGE_KEY = "ml:v2:state";
    const LOG_KEY = "ml:v2:log";

    let storageAvailable = true;

    function defaultState() {
        return {
            version: 2,
            carrito: [],
            favoritos: [],
            pedidos: [],
            contador: {},
            liveLikes: 0,
            stock: Object.fromEntries(PRODUCTOS.map((p) => [p.id, p.stock])),
            filtros: { q: "", categoria: "Todas", orden: "relevancia" }
        };
    }

    function sanitizeState(raw) {
        const base = defaultState();

        if (!raw || typeof raw !== "object") return base;

        const out = { ...base, version: 2 };
        const validIds = new Set(PRODUCTOS.map((p) => p.id));

        // Stock
        const stock = { ...base.stock };
        if (raw.stock && typeof raw.stock === "object") {
            PRODUCTOS.forEach((p) => {
                if (Object.prototype.hasOwnProperty.call(raw.stock, p.id)) {
                    const n = Math.floor(Number(raw.stock[p.id]));
                    if (Number.isFinite(n)) stock[p.id] = Math.max(0, n);
                }
            });
        }
        out.stock = stock;

        out.liveLikes = Math.max(0, Math.floor(Number(raw.liveLikes) || 0));

        // Favoritos
        out.favoritos = Array.isArray(raw.favoritos)
            ? [...new Set(raw.favoritos.filter((id) => validIds.has(id)))]
            : [];

        // Carrito
        let carrito = Array.isArray(raw.carrito)
            ? raw.carrito
                .filter((item) => item && validIds.has(item.id))
                .map((item) => ({
                    id: item.id,
                    cantidad: Math.max(1, Math.floor(Number(item.cantidad) || 1))
                }))
            : [];

        const mapaCarrito = new Map();
        carrito.forEach((item) => {
            mapaCarrito.set(item.id, (mapaCarrito.get(item.id) || 0) + item.cantidad);
        });

        out.carrito = [...mapaCarrito]
            .map(([id, cantidad]) => ({
                id,
                cantidad: Math.min(cantidad, stock[id] || 0, CONFIG.maxPorPedido)
            }))
            .filter((item) => item.cantidad > 0);

        // Pedidos
        out.pedidos = Array.isArray(raw.pedidos)
            ? raw.pedidos
                .filter((o) => o && typeof o.numero === "string" && Array.isArray(o.items))
                .map((o) => ({
                    ...o,
                    cliente: String(o.cliente || ""),
                    telefono: String(o.telefono || ""),
                    email: String(o.email || ""),
                    entrega: o.entrega === "envio" ? "envio" : "retiro",
                    ciudad: String(o.ciudad || ""),
                    direccion: String(o.direccion || ""),
                    pago: o.pago === "transferencia" ? "transferencia" : "efectivo",
                    referencia: String(o.referencia || ""),
                    fechaPreferida: String(o.fechaPreferida || ""),
                    fechaKey: typeof o.fechaKey === "string" ? o.fechaKey : localDateKey(),
                    fechaTexto: String(o.fechaTexto || ""),
                    creado: Number(o.creado) || Date.now(),
                    items: o.items
                        .filter((item) => item && typeof item.id === "string")
                        .map((item) => ({
                            id: item.id,
                            nombre: String(item.nombre || productById(item.id)?.nombre || "Producto retirado"),
                            precio: Number(item.precio) || 0,
                            cantidad: Math.max(1, Math.floor(Number(item.cantidad) || 1))
                        })),
                    subtotal: Number(o.subtotal) || 0,
                    descuento: o.descuento && typeof o.descuento === "object"
                        ? {
                            codigo: String(o.descuento.codigo || ""),
                            pct: Number(o.descuento.pct) || 0,
                            monto: Number(o.descuento.monto) || 0
                        }
                        : null,
                    total: Number(o.total) || 0,
                    estado: ["pendiente", "confirmado", "entregado"].includes(o.estado)
                        ? o.estado
                        : "pendiente",
                    signature: String(o.signature || "")
                }))
            : [];

        // Contador de pedidos
        const contador = {};
        if (raw.contador && typeof raw.contador === "object") {
            Object.entries(raw.contador).forEach(([key, value]) => {
                const n = Math.floor(Number(value));
                if (Number.isFinite(n) && n >= 0) contador[key] = n;
            });
        }
        out.contador = contador;

        out.filtros = { q: "", categoria: "Todas", orden: "relevancia" };

        return out;
    }

    function loadState() {
        let raw = null;

        try {
            raw = localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            storageAvailable = false;
            return defaultState();
        }

        if (!raw) return defaultState();

        try {
            return sanitizeState(JSON.parse(raw));
        } catch (error) {
            try {
                localStorage.setItem(`${STORAGE_KEY}:broken`, raw);
                localStorage.removeItem(STORAGE_KEY);
            } catch (_) {
                /* sin permisos: se ignora */
            }
            return defaultState();
        }
    }

    let state = loadState();

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            if (storageAvailable) {
                storageAvailable = false;
                toast(
                    "No se pudo guardar en este navegador. Los datos se mantendrán solo en esta sesión.",
                    "error",
                    5000
                );
            }
        }
    }

    // Bitácora
    function loadLog() {
        try {
            const raw = localStorage.getItem(LOG_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed)
                ? parsed
                    .filter((item) => item && item.ts && item.msg)
                    .slice(0, 200)
                : [];
        } catch (error) {
            return [];
        }
    }

    let log = loadLog();

    function saveLog() {
        try {
            localStorage.setItem(LOG_KEY, JSON.stringify(log));
        } catch (error) {
            /* la bitácora es secundaria */
        }
    }

    function addLog(tipo, mensaje) {
        log.unshift({
            ts: Date.now(),
            tipo,
            msg: String(mensaje || "").slice(0, 300)
        });
        log = log.slice(0, 200);
        saveLog();
        renderLog();
    }

    let lastOrder = null;
    let confirmResolve = null;


    /* ======================================================
       4. UTILIDADES DE CARRITO
    ====================================================== */

    function stockOf(id) {
        const n = Number(state.stock[id]);
        return Number.isFinite(n) ? Math.max(0, n) : 0;
    }

    function cartItems() {
        return state.carrito
            .map((item) => {
                const producto = productById(item.id);
                return producto ? { ...producto, cantidad: item.cantidad } : null;
            })
            .filter(Boolean);
    }

    function cartCount() {
        return state.carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    function cartSubtotal() {
        return cartItems().reduce(
            (total, producto) => total + producto.precio * producto.cantidad,
            0
        );
    }

    function getEntrega() {
        return $('input[name="entrega"]:checked')?.value || "";
    }


    /* ======================================================
       5. RENDERIZADO
    ====================================================== */

    function renderCategorias() {
        const contenedor = $("#categorias");
        if (!contenedor) return;

        const categorias = ["Todas", ...new Set(PRODUCTOS.map((p) => p.categoria))];

        if (!categorias.includes(state.filtros.categoria)) {
            state.filtros.categoria = "Todas";
        }

        contenedor.replaceChildren(
            ...categorias.map((categoria) => {
                const boton = document.createElement("button");
                const activa = categoria === state.filtros.categoria;

                boton.type = "button";
                boton.className = `chip${activa ? " activo" : ""}`;
                boton.dataset.action = "cat";
                boton.dataset.cat = categoria;
                boton.textContent = categoria;
                boton.setAttribute("aria-pressed", String(activa));

                return boton;
            })
        );
    }

    function getFilteredProducts() {
        const q = normalizeText(state.filtros.q);
        let list = PRODUCTOS.filter((p) => p.activo !== false);

        if (q) {
            list = list.filter((p) =>
                normalizeText(p.nombre).includes(q) ||
                normalizeText(p.categoria).includes(q) ||
                normalizeText(p.codigo).includes(q) ||
                normalizeText(p.codigo.replace(/-/g, "")).includes(q)
            );
        }

        if (state.filtros.categoria !== "Todas") {
            list = list.filter((p) => p.categoria === state.filtros.categoria);
        }

        switch (state.filtros.orden) {
            case "precio-asc":
                list.sort((a, b) => a.precio - b.precio);
                break;
            case "precio-desc":
                list.sort((a, b) => b.precio - a.precio);
                break;
            case "nombre":
                list.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
                break;
            default:
                break;
        }

        return list;
    }

    function renderProducts() {
        const contenedor = $("#productos");
        const plantilla = $("#tpl-producto");
        if (!contenedor || !plantilla) return;

        const list = getFilteredProducts();
        const fragmento = document.createDocumentFragment();

        list.forEach((producto) => {
            const nodo = plantilla.content.firstElementChild.cloneNode(true);
            const stock = stockOf(producto.id);

            nodo.dataset.id = producto.id;

            const imagen = nodo.querySelector("[data-imagen]");
            const fallback = nodo.querySelector("[data-emoji]");

            if (producto.imagen) {
                imagen.src = producto.imagen;
                imagen.alt = producto.alt || producto.nombre;
                imagen.addEventListener("error", () => {
                    imagen.hidden = true;
                    fallback.hidden = false;
                    fallback.textContent = producto.emoji;
                }, { once: true });
            } else {
                imagen.hidden = true;
                fallback.hidden = false;
                fallback.textContent = producto.emoji;
            }

            nodo.querySelector("[data-cat]").textContent = producto.categoria.toUpperCase();
            nodo.querySelector("[data-codigo]").textContent = producto.codigo;
            nodo.querySelector("[data-nombre]").textContent = producto.nombre;
            nodo.querySelector("[data-desc]").textContent = producto.descripcion;
            nodo.querySelector("[data-precio]").textContent = money(producto.precio);

            const stockEl = nodo.querySelector("[data-stock]");
            stockEl.textContent = stock === 0
                ? "Agotado"
                : stock === 1
                    ? "¡Última unidad!"
                    : stock <= 2
                        ? `¡Últimas ${stock} unidades!`
                        : `Disponible: ${stock}`;
            stockEl.classList.toggle("agotado", stock === 0);
            stockEl.classList.toggle("pocas", stock > 0 && stock <= 2);

            const add = nodo.querySelector('[data-action="add"]');
            const buy = nodo.querySelector('[data-action="buy"]');
            const fav = nodo.querySelector('[data-action="fav"]');

            [add, buy, fav].forEach((boton) => {
                boton.dataset.id = producto.id;
            });

            if (stock === 0) {
                add.disabled = true;
                buy.disabled = true;
                add.textContent = "Agotado";
            }

            const esFavorito = state.favoritos.includes(producto.id);
            fav.classList.toggle("activo", esFavorito);
            fav.setAttribute("aria-pressed", String(esFavorito));
            fav.textContent = esFavorito ? "❤️ Guardado" : "❤️ Favorito";

            fragmento.appendChild(nodo);
        });

        contenedor.replaceChildren(fragmento);

        const contador = $("#resultadoCount");
        if (contador) {
            contador.textContent = `${list.length} ${plural(list.length, "modelo", "modelos")}`;
        }

        const sinResultados = $("#sinResultados");
        if (sinResultados) sinResultados.hidden = list.length > 0;
    }

    function renderStats() {
        const totalPedidos = state.pedidos.reduce(
            (total, o) => total + (Number(o.total) || 0),
            0
        );

        const pedidosEl = $("#misPedidos");
        const pedidosLabel = $("#misPedidosLabel");
        const totalEl = $("#totalPedidos");
        const likes = $("#contadorLikes");
        const cartCountEl = $("#cartCount");
        const ordersBadge = $("#ordersBadge");

        if (pedidosEl) pedidosEl.textContent = state.pedidos.length;
        if (pedidosLabel) {
            pedidosLabel.textContent = plural(state.pedidos.length, "pedido", "pedidos");
        }
        if (totalEl) totalEl.textContent = money(totalPedidos);
        if (likes) likes.textContent = state.favoritos.length;
        if (cartCountEl) cartCountEl.textContent = cartCount();
        if (ordersBadge) {
            ordersBadge.textContent = state.pedidos.filter((o) => o.estado === "pendiente").length;
        }
    }

    function renderCart() {
        const contenedor = $("#cartItems");
        const plantilla = $("#tpl-cart-item");
        if (!contenedor || !plantilla) return;

        const items = cartItems();

        if (!items.length) {
            const vacio = document.createElement("p");
            vacio.className = "vacio";
            vacio.textContent = "Tu carrito está vacío. Agrega una moto para empezar.";
            contenedor.replaceChildren(vacio);
        } else {
            const fragmento = document.createDocumentFragment();

            items.forEach((producto) => {
                const nodo = plantilla.content.firstElementChild.cloneNode(true);
                nodo.dataset.id = producto.id;

                nodo.querySelector("[data-nombre]").textContent = producto.nombre;
                nodo.querySelector("[data-unitario]").textContent = `${money(producto.precio)} c/u`;
                nodo.querySelector("[data-cantidad]").textContent = producto.cantidad;
                nodo.querySelector("[data-subtotal]").textContent = money(producto.precio * producto.cantidad);

                const botones = [
                    nodo.querySelector('[data-action="qty-minus"]'),
                    nodo.querySelector('[data-action="qty-plus"]'),
                    nodo.querySelector('[data-action="remove"]')
                ];

                botones.forEach((boton) => {
                    boton.dataset.id = producto.id;
                });

                const maximo = Math.min(stockOf(producto.id), CONFIG.maxPorPedido);
                botones[1].disabled = producto.cantidad >= maximo;

                fragmento.appendChild(nodo);
            });

            contenedor.replaceChildren(fragmento);
        }

        const total = $("#cartTotal");
        if (total) total.textContent = money(cartSubtotal());

        const vaciar = $("#clearCartBtn");
        const continuar = $("#checkoutBtn");
        if (vaciar) vaciar.disabled = !items.length;
        if (continuar) continuar.disabled = !items.length;

        const badge = $("#cartCount");
        if (badge) badge.textContent = cartCount();
    }

    function renderCheckoutSummary() {
        const lista = $("#checkoutItems");
        if (!lista) return;

        const items = cartItems();
        lista.replaceChildren();

        if (!items.length) {
            const vacio = document.createElement("li");
            vacio.textContent = "Tu carrito está vacío.";
            lista.appendChild(vacio);
        } else {
            items.forEach((producto) => {
                const li = document.createElement("li");
                const nombre = document.createElement("span");
                const valor = document.createElement("strong");

                nombre.textContent = `${producto.nombre} x${producto.cantidad}`;
                valor.textContent = money(producto.precio * producto.cantidad);

                li.append(nombre, valor);
                lista.appendChild(li);
            });
        }

        const subtotal = cartSubtotal();
        const resultadoDescuento = getDiscount(subtotal);
        const descuento = resultadoDescuento.ok ? resultadoDescuento.discount : null;
        const total = subtotal - (descuento ? descuento.monto : 0);

        const subtotalEl = $("#checkoutSubtotal");
        const totalEl = $("#checkoutTotal");
        if (subtotalEl) subtotalEl.textContent = money(subtotal);
        if (totalEl) totalEl.textContent = money(total);

        const fila = $("#descuentoRow");
        if (!fila) return;

        if (descuento) {
            fila.hidden = false;
            $("#descuentoLabel").textContent =
                `Descuento (${descuento.codigo} -${descuento.pct}%)`;
            $("#checkoutDescuento").textContent = `-${money(descuento.monto)}`;
        } else {
            fila.hidden = true;
        }
    }

    function renderOrders() {
        const lista = $("#ordersList");
        const filtroEl = $("#orderFilter");
        if (!lista) return;

        const filtro = filtroEl ? filtroEl.value : "todos";
        let pedidos = [...state.pedidos].sort((a, b) => b.creado - a.creado);

        if (filtro === "hoy") {
            pedidos = pedidos.filter((o) => o.fechaKey === localDateKey());
        } else if (filtro !== "todos") {
            pedidos = pedidos.filter((o) => o.estado === filtro);
        }

        if (!pedidos.length) {
            const vacio = document.createElement("p");
            vacio.className = "vacio";
            vacio.textContent = state.pedidos.length
                ? "No hay pedidos con ese filtro."
                : "Todavía no hay pedidos registrados.";
            lista.replaceChildren(vacio);
        } else {
            const plantilla = $("#tpl-pedido");
            const fragmento = document.createDocumentFragment();

            pedidos.forEach((pedido) => {
                const nodo = plantilla.content.firstElementChild.cloneNode(true);

                nodo.querySelector("[data-num]").textContent = pedido.numero;

                const chip = nodo.querySelector("[data-estado]");
                chip.textContent = pedido.estado;
                chip.classList.add(`estado-${pedido.estado}`);

                nodo.querySelector("[data-cliente]").textContent =
                    `${pedido.cliente} · ${formatPhone(pedido.telefono)}`;

                nodo.querySelector("[data-detalle]").textContent =
                    `${pedido.fechaTexto || ""} · ${pedido.items
                        .map((item) => `${item.nombre} x${item.cantidad}`)
                        .join(", ")}`;

                nodo.querySelector("[data-total]").textContent = money(pedido.total);

                const whatsapp = nodo.querySelector('[data-action="wa-order"]');
                const eliminar = nodo.querySelector('[data-action="del-order"]');
                const select = nodo.querySelector('[data-action="status"]');

                whatsapp.dataset.num = pedido.numero;
                eliminar.dataset.num = pedido.numero;
                select.dataset.num = pedido.numero;

                ["pendiente", "confirmado", "entregado"].forEach((estado) => {
                    const opcion = document.createElement("option");
                    opcion.value = estado;
                    opcion.textContent = estado.charAt(0).toUpperCase() + estado.slice(1);
                    select.appendChild(opcion);
                });

                select.value = pedido.estado;

                fragmento.appendChild(nodo);
            });

            lista.replaceChildren(fragmento);
        }

        const resumen = $("#ordersResumen");
        if (resumen) {
            const total = state.pedidos.reduce(
                (suma, o) => suma + (Number(o.total) || 0),
                0
            );
            const pendientes = state.pedidos.filter((o) => o.estado === "pendiente").length;

            resumen.textContent =
                `${state.pedidos.length} ${plural(state.pedidos.length, "pedido", "pedidos")} · ${pendientes} en proceso · Total: ${money(total)}`;
        }
    }

    function renderLog() {
        const contenedor = $("#logOutput");
        if (!contenedor) return;

        const filtro = $("#logFiltro") ? $("#logFiltro").value : "todos";
        const items = filtro === "todos" ? log : log.filter((item) => item.tipo === filtro);

        if (!items.length) {
            const vacio = document.createElement("p");
            vacio.className = "log-vacio";
            vacio.textContent = "Sin actividad registrada.";
            contenedor.replaceChildren(vacio);
            return;
        }

        const fragmento = document.createDocumentFragment();

        items.forEach((item) => {
            const fila = document.createElement("div");
            fila.className = `log-item tipo-${item.tipo}`;

            const hora = document.createElement("span");
            hora.className = "log-hora";
            hora.textContent = new Date(item.ts).toLocaleTimeString(CONFIG.locale, {
                hour12: false
            });

            const tipo = document.createElement("span");
            tipo.className = "log-tipo";
            tipo.textContent = item.tipo;

            const mensaje = document.createElement("span");
            mensaje.textContent = item.msg;

            fila.append(hora, tipo, mensaje);
            fragmento.appendChild(fila);
        });

        contenedor.replaceChildren(fragmento);
    }

    function renderLive() {
        const likes = $("#liveLikes");
        if (likes) likes.textContent = state.liveLikes;
    }

    function renderLiveOfertas() {
        const contenedor = $("#liveOfertas");
        if (!contenedor) return;

        const destacados = PRODUCTOS.filter((p) => p.activo !== false).slice(0, 3);
        const fragmento = document.createDocumentFragment();

        destacados.forEach((producto) => {
            const stock = stockOf(producto.id);
            const articulo = document.createElement("article");
            articulo.className = "live-oferta";

            const imagen = document.createElement("img");
            imagen.src = producto.imagen;
            imagen.alt = producto.alt || producto.nombre;
            imagen.loading = "lazy";

            const info = document.createElement("div");
            info.className = "live-oferta-info";

            const nombre = document.createElement("strong");
            nombre.textContent = producto.nombre;

            const precio = document.createElement("span");
            precio.textContent = money(producto.precio);

            info.append(nombre, precio);

            const stockEl = document.createElement("p");
            stockEl.className = "stock";
            stockEl.textContent = stock === 0
                ? "Agotado"
                : stock === 1
                    ? "¡Última unidad!"
                    : stock <= 2
                        ? `¡Últimas ${stock} unidades!`
                        : `Disponible: ${stock}`;
            stockEl.classList.toggle("agotado", stock === 0);
            stockEl.classList.toggle("pocas", stock > 0 && stock <= 2);

            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "btn-oferta";
            boton.dataset.liveAction = "live-add";
            boton.dataset.id = producto.id;
            boton.dataset.prod = producto.nombre;
            boton.textContent = stock === 0 ? "Agotado" : "🛒 Comprar en vivo";
            boton.disabled = stock === 0;

            articulo.append(imagen, info, stockEl, boton);
            fragmento.appendChild(articulo);
        });

        contenedor.replaceChildren(fragmento);
    }

    function renderLiveForm() {
        const select = $("#liveProductSelect");
        if (!select) return;

        const anterior = select.value;
        const disponibles = PRODUCTOS.filter(
            (p) => p.activo !== false && stockOf(p.id) > 0
        );

        select.replaceChildren();

        if (!disponibles.length) {
            const opcion = document.createElement("option");
            opcion.value = "";
            opcion.textContent = "Sin stock disponible";
            select.appendChild(opcion);
            select.disabled = true;
            updateLiveTotal();
            return;
        }

        select.disabled = false;

        disponibles.forEach((producto) => {
            const opcion = document.createElement("option");
            opcion.value = producto.id;
            opcion.textContent = `${producto.nombre} — ${money(producto.precio)}`;
            select.appendChild(opcion);
        });

        select.value = disponibles.some((p) => p.id === anterior)
            ? anterior
            : disponibles[0].id;

        updateLiveTotal();
    }

    function updateLiveTotal() {
        const total = $("#liveOrderTotal");
        if (!total) return;

        const producto = productById($("#liveProductSelect")?.value);
        const variante = VARIANTES[$("#variantSelect")?.value] || VARIANTES.estandar;

        total.textContent = money(producto ? producto.precio + variante.extra : 0);
    }

    function spawnHearts() {
        const stage = $("#liveStage");
        if (!stage) return;

        for (let i = 0; i < 3; i += 1) {
            const heart = document.createElement("span");
            heart.className = "heart-float";
            heart.textContent = "❤️";
            heart.style.left = `${18 + Math.random() * 64}%`;
            heart.style.animationDelay = `${i * 0.08}s`;
            stage.appendChild(heart);
            setTimeout(() => heart.remove(), 1400);
        }
    }

    function sendLike() {
        state.liveLikes += 1;
        saveState();
        renderLive();
        spawnHearts();
        addLog("live", `LIKE_STREAM: ❤️ Like al live (${state.liveLikes}).`);
    }

    function sendLiveChat() {
        const input = $("#chatInput");
        const caja = $("#liveChatMensajes");
        if (!input || !caja) return;

        const texto = input.value.trim();

        if (!texto) {
            toast("Escribe un comentario para el live.", "warn");
            return;
        }

        const mensaje = document.createElement("p");
        mensaje.className = "live-chat-msg";

        const usuario = document.createElement("strong");
        usuario.textContent = "Tú:";

        mensaje.append(usuario, document.createTextNode(` ${texto}`));
        caja.appendChild(mensaje);
        caja.scrollTop = caja.scrollHeight;

        input.value = "";
        addLog("live", `CHAT_ENVIADO: "${texto.slice(0, 120)}"`);
    }

    function renderAll() {
        renderCategorias();
        renderProducts();
        renderCart();
        renderStats();
        renderOrders();
        renderLive();
        renderLiveOfertas();
        renderLiveForm();
    }

    function resetFilterUI() {
        state.filtros = { q: "", categoria: "Todas", orden: "relevancia" };

        const buscador = $("#buscador");
        const orden = $("#orden");

        if (buscador) buscador.value = "";
        if (orden) orden.value = "relevancia";
    }


    /* ======================================================
       6. VALIDACIONES
    ====================================================== */

    const MSG_TELEFONO_NUMEROS = "Solo se permiten números en el teléfono.";

    function checkCliente() {
        const valor = cleanName($("#cliente").value);

        if (!valor) return "Ingresa tu nombre.";
        if (valor.length > 50) return "El nombre no puede superar los 50 caracteres.";
        if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(valor)) {
            return "El nombre solo puede contener letras, espacios, puntos, apóstrofos y guiones.";
        }

        const letras = (valor.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
        if (letras < 4) {
            return "El nombre debe tener más de 3 letras (mínimo 4).";
        }

        return "";
    }

    function telefonoError(valor) {
        const raw = String(valor || "").trim();

        if (!raw) return "Ingresa tu número de teléfono.";
        if (/\D/.test(raw)) return MSG_TELEFONO_NUMEROS;

        let n = raw;
        if (/^591[67]\d{7}$/.test(n)) n = n.slice(3);

        if (!/^[67]\d{7}$/.test(n)) {
            return "Ingresa un celular válido de Bolivia: 8 dígitos que empiecen con 6 o 7 (ej. 71234567).";
        }

        return "";
    }

    function checkTelefono() {
        return telefonoError($("#telefono").value);
    }

    function userTikTokError(valor) {
        const raw = String(valor || "").trim();

        if (!raw) return "Ingresa tu usuario de TikTok.";

        const usuario = raw.startsWith("@") ? raw.slice(1) : raw;

        if (usuario.length < 3 || usuario.length > 30) {
            return "El usuario debe tener entre 3 y 30 caracteres.";
        }

        if (!/^[A-Za-z0-9._]+$/.test(usuario)) {
            return "El usuario solo puede tener letras, números, puntos y guiones bajos.";
        }

        return "";
    }

    function normalizeTikTok(valor) {
        const raw = String(valor || "").trim();
        return raw.startsWith("@") ? raw : `@${raw}`;
    }

    function checkEmail() {
        const valor = $("#email").value.trim();

        if (!valor) return "";
        if (valor.length > 100) return "El correo no puede superar los 100 caracteres.";
        if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(valor)) {
            return "Ingresa un correo válido (ej. nombre@correo.com).";
        }

        return "";
    }

    function checkEntrega() {
        return getEntrega() ? "" : "Elige cómo quieres recibir tu moto.";
    }

    function checkCiudad() {
        if (getEntrega() !== "envio") return "";
        return $("#ciudad").value ? "" : "Selecciona tu ciudad.";
    }

    function checkDireccion() {
        if (getEntrega() !== "envio") return "";

        const valor = cleanName($("#direccion").value);

        if (!valor) return "Ingresa la dirección de entrega.";
        if (valor.length < 10) return "La dirección debe tener al menos 10 caracteres.";
        if (valor.length > 120) return "La dirección no puede superar los 120 caracteres.";

        const letras = (valor.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
        if (letras < 4) return "La dirección debe tener más de 3 letras.";

        return "";
    }

    function checkPago() {
        return $("#pago").value ? "" : "Selecciona tu forma de pago.";
    }

    function checkReferencia() {
        if ($("#pago").value !== "transferencia") return "";

        const valor = $("#referencia").value.trim();

        if (!valor) return "Ingresa el número de comprobante.";
        if (!/^[A-Za-z0-9-]{4,20}$/.test(valor)) {
            return "El comprobante debe tener entre 4 y 20 letras o números.";
        }

        return "";
    }

    function checkCodigo() {
        const raw = $("#codigo").value.trim();
        if (!raw) return "";

        const resultado = getDiscount(cartSubtotal());
        return resultado.ok ? "" : resultado.msg;
    }

    function checkFecha() {
        const valor = $("#fecha").value;
        if (!valor) return "";

        if (valor < localDateKey()) return "La fecha no puede ser anterior a hoy.";

        const max = new Date();
        max.setDate(max.getDate() + CONFIG.diasEntrega);

        if (valor > localDateKey(max)) {
            return `Elige una fecha dentro de los próximos ${CONFIG.diasEntrega} días.`;
        }

        return "";
    }

    function checkTerminos() {
        return $("#terminos").checked ? "" : "Debes aceptar los términos para continuar.";
    }

    function getDiscount(subtotal) {
        const codigo = $("#codigo").value.trim().toUpperCase();

        if (!codigo) return { ok: true, discount: null };

        const definicion = CONFIG.descuentos[codigo];

        if (!definicion) return { ok: false, msg: "El código de descuento no es válido." };

        if (definicion.vence) {
            const fin = new Date(`${definicion.vence}T23:59:59`);
            if (Number.isNaN(fin.getTime()) || Date.now() > fin.getTime()) {
                return { ok: false, msg: "El código de descuento ya expiró." };
            }
        }

        const pct = Math.max(0, Math.min(100, Number(definicion.pct) || 0));

        return {
            ok: true,
            discount: {
                codigo,
                pct,
                monto: Math.round((Number(subtotal) || 0) * pct / 100)
            }
        };
    }

    const CHECKOUT_FIELDS = [
        { key: "cliente", label: "Nombre", el: () => $("#cliente"), err: () => $("#err-cliente"), check: checkCliente },
        { key: "telefono", label: "Teléfono", el: () => $("#telefono"), err: () => $("#err-telefono"), check: checkTelefono },
        { key: "email", label: "Correo", el: () => $("#email"), err: () => $("#err-email"), check: checkEmail },
        {
            key: "entrega",
            label: "Entrega",
            el: () => $("#entregaGroup"),
            err: () => $("#err-entrega"),
            check: checkEntrega,
            focus: () => $('input[name="entrega"]')
        },
        { key: "ciudad", label: "Ciudad", el: () => $("#ciudad"), err: () => $("#err-ciudad"), check: checkCiudad },
        { key: "direccion", label: "Dirección", el: () => $("#direccion"), err: () => $("#err-direccion"), check: checkDireccion },
        { key: "pago", label: "Pago", el: () => $("#pago"), err: () => $("#err-pago"), check: checkPago },
        { key: "referencia", label: "Comprobante", el: () => $("#referencia"), err: () => $("#err-referencia"), check: checkReferencia },
        { key: "codigo", label: "Descuento", el: () => $("#codigo"), err: () => $("#err-codigo"), check: checkCodigo },
        { key: "fecha", label: "Fecha", el: () => $("#fecha"), err: () => $("#err-fecha"), check: checkFecha },
        { key: "terminos", label: "Términos", el: () => $("#terminos"), err: () => $("#err-terminos"), check: checkTerminos }
    ];

    function setError(el, errEl, msg) {
        if (errEl) errEl.textContent = msg;
        if (!el) return;

        const campo = el.closest(".campo") || (el.classList.contains("campo") ? el : null);

        if (campo) campo.classList.toggle("campo-error", Boolean(msg));

        if (msg) el.setAttribute("aria-invalid", "true");
        else el.removeAttribute("aria-invalid");
    }

    function setupNumericPhone(input, errEl) {
        if (!input || !errEl) return;

        const validar = () => setError(input, errEl, telefonoError(input.value));

        input.addEventListener("beforeinput", (event) => {
            if (event.data && /\D/.test(event.data) && !/\d/.test(event.data)) {
                event.preventDefault();
                setError(input, errEl, MSG_TELEFONO_NUMEROS);
            }
        });

        input.addEventListener("input", () => {
            const crudo = input.value;
            const digitos = crudo.replace(/\D/g, "").slice(0, 11);

            if (crudo !== digitos) {
                input.value = digitos;
                setError(input, errEl, MSG_TELEFONO_NUMEROS);
            } else if (errEl.textContent === MSG_TELEFONO_NUMEROS) {
                validar();
            }

            hideErrors();
        });

        input.addEventListener("blur", validar);
    }

    function validateField(key) {
        const field = CHECKOUT_FIELDS.find((f) => f.key === key);
        if (!field) return "";

        const msg = field.check();
        setError(field.el(), field.err(), msg);
        return msg;
    }

    function validateCheckout() {
        const errors = [];

        CHECKOUT_FIELDS.forEach((field) => {
            const msg = field.check();
            setError(field.el(), field.err(), msg);

            if (msg) {
                errors.push({
                    label: field.label,
                    msg,
                    el: field.el(),
                    focus: field.focus ? field.focus() : field.el()
                });
            }
        });

        return errors;
    }

    function showErrors(errors) {
        const caja = $("#checkoutErrors");
        if (!caja) return;

        caja.replaceChildren();

        const titulo = document.createElement("strong");
        titulo.textContent = `Revisa ${errors.length} campo(s):`;

        const lista = document.createElement("ul");

        errors.forEach((error) => {
            const li = document.createElement("li");
            li.textContent = `${error.label}: ${error.msg}`;
            lista.appendChild(li);
        });

        caja.append(titulo, lista);
        caja.hidden = false;

        const primero = errors[0].focus || errors[0].el;
        if (primero) {
            primero.focus();
            primero.scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }

    function hideErrors() {
        const caja = $("#checkoutErrors");
        if (caja) caja.hidden = true;
    }

    function clearErrors() {
        $$(".error").forEach((el) => {
            el.textContent = "";
        });
        $$(".campo-error").forEach((el) => {
            el.classList.remove("campo-error");
        });
        $$("[aria-invalid]").forEach((el) => {
            el.removeAttribute("aria-invalid");
        });
        hideErrors();
    }

    function toggleEntrega() {
        const esEnvio = getEntrega() === "envio";
        const campos = $("#envioFields");
        const ciudad = $("#ciudad");
        const direccion = $("#direccion");

        if (campos) campos.hidden = !esEnvio;
        if (ciudad) ciudad.required = esEnvio;
        if (direccion) direccion.required = esEnvio;

        if (!esEnvio) {
            setError(ciudad, $("#err-ciudad"), "");
            setError(direccion, $("#err-direccion"), "");
        }
    }

    function togglePago() {
        const esTransferencia = $("#pago").value === "transferencia";
        const campo = $("#referenciaField");
        const referencia = $("#referencia");

        if (campo) campo.hidden = !esTransferencia;
        if (referencia) referencia.required = esTransferencia;

        if (!esTransferencia) {
            setError(referencia, $("#err-referencia"), "");
        }
    }


    /* ======================================================
       7. CARRITO
    ====================================================== */

    function addToCart(id, cantidad = 1, silencioso = false) {
        const producto = productById(id);
        if (!producto) return false;

        const stock = stockOf(id);

        if (stock <= 0) {
            toast(`${producto.nombre} está agotada.`, "warn");
            return false;
        }

        const item = state.carrito.find((i) => i.id === id);
        const actual = item ? item.cantidad : 0;
        const maximo = Math.min(stock, CONFIG.maxPorPedido);

        if (actual + cantidad > maximo) {
            toast(`Solo puedes agregar ${maximo} ${plural(maximo, "unidad", "unidades")} de ${producto.nombre}.`, "warn");
            return false;
        }

        if (item) item.cantidad += cantidad;
        else state.carrito.push({ id, cantidad });

        saveState();
        renderCart();
        renderStats();

        addLog("carrito", `${producto.nombre} agregado al carrito (${actual + cantidad}).`);

        if (!silencioso) {
            toast(`${producto.nombre} agregado al carrito.`, "ok", 2200);
        }

        return true;
    }

    function changeQty(id, delta) {
        const item = state.carrito.find((i) => i.id === id);
        if (!item) return;

        const producto = productById(id);
        const maximo = Math.min(stockOf(id), CONFIG.maxPorPedido);

        if (delta > 0 && item.cantidad >= maximo) {
            toast(`Máximo ${maximo} ${plural(maximo, "unidad", "unidades")} por pedido.`, "warn");
            return;
        }

        item.cantidad += delta;

        if (item.cantidad <= 0) {
            state.carrito = state.carrito.filter((i) => i.id !== id);
            if (producto) addLog("carrito", `${producto.nombre} eliminado del carrito.`);
        }

        saveState();
        renderCart();
        renderStats();
    }

    function removeFromCart(id) {
        const producto = productById(id);

        state.carrito = state.carrito.filter((i) => i.id !== id);
        saveState();
        renderCart();
        renderStats();

        if (producto) {
            addLog("carrito", `${producto.nombre} eliminado del carrito.`);
            toast("Producto eliminado.", "info", 1600);
        }
    }

    async function clearCart() {
        if (!state.carrito.length) return;

        const confirmado = await askConfirm(
            "Vaciar carrito",
            "Se quitarán todas las motos del carrito.",
            "Vaciar"
        );

        if (!confirmado) return;

        state.carrito = [];
        saveState();
        renderCart();
        renderStats();
        addLog("carrito", "Carrito vaciado.");
        toast("Carrito vaciado.", "ok");
    }

    function toggleFav(id, boton) {
        const producto = productById(id);
        if (!producto) return;

        const indice = state.favoritos.indexOf(id);
        const activar = indice === -1;

        if (activar) state.favoritos.push(id);
        else state.favoritos.splice(indice, 1);

        saveState();

        if (boton) {
            boton.classList.toggle("activo", activar);
            boton.setAttribute("aria-pressed", String(activar));
            boton.textContent = activar ? "❤️ Guardado" : "❤️ Favorito";
        }

        renderStats();
        addLog("favorito", `${producto.nombre} ${activar ? "guardado en" : "eliminado de"} favoritos.`);
        toast(activar ? "Guardado en favoritos." : "Eliminado de favoritos.", activar ? "ok" : "info", 1800);
    }


    /* ======================================================
       8. CHECKOUT Y PEDIDOS
    ====================================================== */

    function setDateLimits() {
        const fecha = $("#fecha");
        if (!fecha) return;

        fecha.min = localDateKey();

        const max = new Date();
        max.setDate(max.getDate() + CONFIG.diasEntrega);
        fecha.max = localDateKey(max);
    }

    function openCheckout() {
        if (!state.carrito.length) {
            toast("Tu carrito está vacío. Agrega una moto primero.", "warn");
            return;
        }

        const carritoDialog = $("#cartDialog");
        if (carritoDialog && carritoDialog.open) carritoDialog.close();

        hideErrors();
        toggleEntrega();
        togglePago();
        setDateLimits();
        renderCheckoutSummary();

        showDialog($("#checkoutDialog"));
        setTimeout(() => $("#cliente").focus(), 80);
        addLog("sistema", "Checkout abierto.");
    }

    function nextOrderNumber(fechaKey = localDateKey()) {
        const secuenciaKey = fechaKey.replace(/-/g, "");

        const maxPedidos = state.pedidos.reduce((maximo, pedido) => {
            if (pedido.fechaKey !== fechaKey) return maximo;
            const coincidencia = String(pedido.numero).match(/^ML-\d{8}-(\d+)$/);
            return Math.max(maximo, coincidencia ? Number(coincidencia[1]) : 0);
        }, 0);

        const secuencia = Math.max(state.contador[secuenciaKey] || 0, maxPedidos) + 1;
        state.contador[secuenciaKey] = secuencia;

        return `ML-${secuenciaKey}-${String(secuencia).padStart(3, "0")}`;
    }

    function createOrder({ subtotal, discount, telefono, signature }) {
        const ahora = new Date();
        const fechaKey = localDateKey(ahora);
        const numero = nextOrderNumber(fechaKey);
        const entrega = getEntrega();
        const pago = $("#pago").value;

        const items = cartItems().map((producto) => ({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: producto.cantidad
        }));

        return {
            numero,
            creado: ahora.getTime(),
            fechaKey,
            fechaTexto: ahora.toLocaleString(CONFIG.locale, {
                dateStyle: "short",
                timeStyle: "short"
            }),
            cliente: cleanName($("#cliente").value),
            telefono,
            email: $("#email").value.trim().toLowerCase(),
            entrega,
            ciudad: entrega === "envio" ? $("#ciudad").value : "",
            direccion: entrega === "envio" ? cleanName($("#direccion").value) : "",
            pago,
            referencia: pago === "transferencia"
                ? $("#referencia").value.trim().toUpperCase()
                : "",
            fechaPreferida: $("#fecha").value || "",
            items,
            subtotal,
            descuento: discount,
            total: subtotal - (discount ? discount.monto : 0),
            estado: "pendiente",
            signature
        };
    }

    async function handleCheckoutSubmit(event) {
        event.preventDefault();

        // Honeypot anti-bot
        if ($("#website").value.trim()) return;

        const errors = validateCheckout();

        if (errors.length) {
            showErrors(errors);
            addLog("validacion", `Pedido no enviado: ${errors.length} campo(s) con error.`);
            return;
        }

        hideErrors();

        const boton = $("#submitOrder");
        const textoOriginal = boton.textContent;
        boton.disabled = true;
        boton.textContent = "Procesando...";

        try {
            // Verificación final de stock
            for (const item of state.carrito) {
                const producto = productById(item.id);

                if (!producto) {
                    toast("Un producto del carrito ya no está disponible.", "error");
                    return;
                }

                if (item.cantidad > stockOf(item.id)) {
                    toast(
                        `Stock insuficiente para ${producto.nombre}. Disponible: ${stockOf(item.id)}.`,
                        "error"
                    );
                    renderAll();
                    return;
                }
            }

            const subtotal = cartSubtotal();
            const resultadoDescuento = getDiscount(subtotal);

            if (!resultadoDescuento.ok) {
                validateField("codigo");
                toast(resultadoDescuento.msg, "error");
                return;
            }

            const telefono = normalizePhone($("#telefono").value);
            const signature = state.carrito
                .map((item) => `${item.id}:${item.cantidad}`)
                .sort()
                .join("|");

            const reciente = state.pedidos.find((pedido) =>
                Date.now() - pedido.creado < 5 * 60 * 1000 &&
                pedido.telefono === telefono &&
                pedido.signature === signature
            );

            if (reciente) {
                const continuar = await askConfirm(
                    "Pedido duplicado",
                    `Ya registraste el pedido ${reciente.numero} hace menos de 5 minutos. ¿Registrar otro igual?`,
                    "Sí, registrar",
                    false
                );

                if (!continuar) return;
            }

            const pedido = createOrder({
                subtotal,
                discount: resultadoDescuento.discount,
                telefono,
                signature
            });

            state.pedidos.unshift(pedido);

            for (const item of state.carrito) {
                state.stock[item.id] = Math.max(0, stockOf(item.id) - item.cantidad);
            }

            state.carrito = [];
            saveState();

            renderAll();
            renderTicket(pedido);

            $("#checkoutForm").reset();
            clearErrors();
            toggleEntrega();
            togglePago();
            updateCheckoutSummary();

            $("#checkoutDialog").close();
            showDialog($("#orderDialog"));

            addLog("venta", `Pedido ${pedido.numero} por ${money(pedido.total)} — ${pedido.cliente}.`);
            toast("Pedido registrado. Compártelo por WhatsApp.", "ok");
        } finally {
            boton.disabled = false;
            boton.textContent = textoOriginal;
        }
    }

    function handleLiveOrderSubmit(event) {
        event.preventDefault();

        const usuarioInput = $("#userTikTok");
        const telefonoInput = $("#livePhone");
        const errUsuario = $("#err-userTikTok");
        const errTelefonoLive = $("#err-livePhone");

        const usuarioMsg = userTikTokError(usuarioInput.value);
        const telefonoMsg = telefonoError(telefonoInput.value);

        setError(usuarioInput, errUsuario, usuarioMsg);
        setError(telefonoInput, errTelefonoLive, telefonoMsg);

        if (usuarioMsg) {
            usuarioInput.focus();
            toast(usuarioMsg, "error");
            return;
        }

        if (telefonoMsg) {
            telefonoInput.focus();
            toast(telefonoMsg, "error");
            return;
        }

        const producto = productById($("#liveProductSelect").value);

        if (!producto) {
            toast("Selecciona un producto con stock disponible.", "warn");
            return;
        }

        if (stockOf(producto.id) <= 0) {
            toast(`${producto.nombre} está agotada.`, "warn");
            renderAll();
            return;
        }

        const varianteKey = $("#variantSelect").value;
        const variante = VARIANTES[varianteKey] || VARIANTES.estandar;
        const precio = producto.precio + variante.extra;
        const ahora = new Date();
        const fechaKey = localDateKey(ahora);
        const numero = nextOrderNumber(fechaKey);

        const pedido = {
            numero,
            creado: ahora.getTime(),
            fechaKey,
            fechaTexto: ahora.toLocaleString(CONFIG.locale, {
                dateStyle: "short",
                timeStyle: "short"
            }),
            cliente: normalizeTikTok(usuarioInput.value),
            telefono: normalizePhone(telefonoInput.value),
            email: "",
            entrega: "retiro",
            ciudad: "",
            direccion: "",
            pago: "efectivo",
            referencia: "",
            fechaPreferida: "",
            items: [{
                id: producto.id,
                nombre: `${producto.nombre} — ${variante.label}`,
                precio,
                cantidad: 1
            }],
            subtotal: precio,
            descuento: null,
            total: precio,
            estado: "pendiente",
            signature: `live:${producto.id}:${varianteKey}`
        };

        state.pedidos.unshift(pedido);
        state.stock[producto.id] = Math.max(0, stockOf(producto.id) - 1);
        saveState();

        renderAll();
        renderTicket(pedido);
        showDialog($("#orderDialog"));

        addLog(
            "venta",
            `COMPRA_EXITOSA: Pedido ${pedido.numero} — ${pedido.cliente} — ${money(pedido.total)}.`
        );
        toast("Compra rápida registrada.", "ok");

        $("#orderForm").reset();
        setError($("#userTikTok"), $("#err-userTikTok"), "");
        setError($("#livePhone"), $("#err-livePhone"), "");
        updateLiveTotal();
    }

    function updateCheckoutSummary() {
        renderCheckoutSummary();
    }

    function entregaTexto(pedido) {
        if (pedido.entrega === "envio") {
            return `Envío a ${pedido.ciudad} — ${pedido.direccion}`;
        }
        return `Retiro en tienda (${CONFIG.ciudad})`;
    }

    function pagoTexto(pedido) {
        if (pedido.pago === "transferencia") {
            return `Transferencia / QR${pedido.referencia ? ` (ref. ${pedido.referencia})` : ""}`;
        }
        return "Efectivo contra entrega";
    }

    function orderMessage(pedido) {
        const lineas = [
            `*${CONFIG.negocio} — Pedido ${pedido.numero}*`,
            `Fecha: ${pedido.fechaTexto}`,
            `Cliente: ${pedido.cliente}`,
            `Teléfono: ${formatPhone(pedido.telefono)}`
        ];

        if (pedido.email) lineas.push(`Correo: ${pedido.email}`);

        lineas.push(`Entrega: ${entregaTexto(pedido)}`);
        lineas.push(`Pago: ${pagoTexto(pedido)}`);
        lineas.push("");
        lineas.push("*Productos:*");

        pedido.items.forEach((item) => {
            lineas.push(`• ${item.nombre} x${item.cantidad} — ${money(item.precio * item.cantidad)}`);
        });

        lineas.push("");
        lineas.push(`Subtotal: ${money(pedido.subtotal)}`);

        if (pedido.descuento) {
            lineas.push(
                `Descuento (${pedido.descuento.codigo} -${pedido.descuento.pct}%): -${money(pedido.descuento.monto)}`
            );
        }

        lineas.push(`*Total: ${money(pedido.total)}*`);

        if (pedido.fechaPreferida) {
            lineas.push(`Fecha preferida: ${pedido.fechaPreferida}`);
        }

        lineas.push("");
        lineas.push("Pedido generado desde la página de MotoLegend.");

        return lineas.join("\n");
    }

    function ticketText(pedido) {
        const lineas = [
            `${CONFIG.negocio} — Pedido ${pedido.numero}`,
            `Fecha: ${pedido.fechaTexto}`,
            `Cliente: ${pedido.cliente}`,
            `Teléfono: ${formatPhone(pedido.telefono)}`,
            `Entrega: ${entregaTexto(pedido)}`,
            `Pago: ${pagoTexto(pedido)}`,
            "",
            "Productos:"
        ];

        pedido.items.forEach((item) => {
            lineas.push(`- ${item.nombre} x${item.cantidad}: ${money(item.precio * item.cantidad)}`);
        });

        lineas.push("");
        lineas.push(`Subtotal: ${money(pedido.subtotal)}`);

        if (pedido.descuento) {
            lineas.push(
                `Descuento (${pedido.descuento.codigo} -${pedido.descuento.pct}%): -${money(pedido.descuento.monto)}`
            );
        }

        lineas.push(`TOTAL: ${money(pedido.total)}`);

        if (pedido.fechaPreferida) {
            lineas.push(`Fecha preferida: ${pedido.fechaPreferida}`);
        }

        return lineas.join("\n");
    }

    function renderTicket(pedido) {
        const plantilla = $("#tpl-ticket");
        const contenedor = $("#ticketContainer");
        if (!plantilla || !contenedor) return;

        const nodo = plantilla.content.firstElementChild.cloneNode(true);

        nodo.querySelector("[data-num]").textContent = pedido.numero;

        const lista = nodo.querySelector("[data-items]");

        pedido.items.forEach((item) => {
            const li = document.createElement("li");
            const nombre = document.createElement("span");
            const subtotal = document.createElement("strong");

            nombre.textContent = `${item.nombre} x${item.cantidad}`;
            subtotal.textContent = money(item.precio * item.cantidad);

            li.append(nombre, subtotal);
            lista.appendChild(li);
        });

        nodo.querySelector("[data-subtotal]").textContent = money(pedido.subtotal);

        if (pedido.descuento) {
            const fila = nodo.querySelector("[data-desc-row]");
            fila.hidden = false;
            nodo.querySelector("[data-desc-label]").textContent =
                `Descuento (${pedido.descuento.codigo} -${pedido.descuento.pct}%)`;
            nodo.querySelector("[data-descuento]").textContent =
                `-${money(pedido.descuento.monto)}`;
        }

        nodo.querySelector("[data-total]").textContent = money(pedido.total);
        nodo.querySelector("[data-cliente]").textContent = pedido.cliente;
        nodo.querySelector("[data-telefono]").textContent = formatPhone(pedido.telefono);
        nodo.querySelector("[data-entrega]").textContent = entregaTexto(pedido);
        nodo.querySelector("[data-pago]").textContent = pagoTexto(pedido);

        if (pedido.fechaPreferida) {
            const fila = nodo.querySelector("[data-fecha-row]");
            fila.hidden = false;
            nodo.querySelector("[data-fecha]").textContent = pedido.fechaPreferida;
        }

        contenedor.replaceChildren(nodo);
        lastOrder = pedido;
    }

    function shareOrder(numero) {
        const pedido = state.pedidos.find((p) => p.numero === numero);
        if (!pedido) return;

        window.open(waLink(orderMessage(pedido)), "_blank", "noopener");
        addLog("venta", `Pedido ${numero} compartido por WhatsApp.`);
    }

    function setOrderStatus(numero, estado) {
        if (!["pendiente", "confirmado", "entregado"].includes(estado)) return;

        const pedido = state.pedidos.find((p) => p.numero === numero);
        if (!pedido) return;

        pedido.estado = estado;
        saveState();
        renderOrders();
        renderStats();
        addLog("venta", `Pedido ${numero} marcado como ${estado}.`);
        toast(`Pedido ${numero}: ${estado}.`, "ok", 2200);
    }

    async function deleteOrder(numero) {
        const pedido = state.pedidos.find((p) => p.numero === numero);
        if (!pedido) return;

        const confirmado = await askConfirm(
            "Eliminar pedido",
            `Se eliminará ${numero} y se devolverá el stock de sus productos.`,
            "Eliminar"
        );

        if (!confirmado) return;

        pedido.items.forEach((item) => {
            if (!productById(item.id)) return;
            state.stock[item.id] = stockOf(item.id) + item.cantidad;
        });

        state.pedidos = state.pedidos.filter((p) => p.numero !== numero);

        if (lastOrder && lastOrder.numero === numero) lastOrder = null;

        saveState();
        renderAll();
        addLog("sistema", `Pedido ${numero} eliminado; stock restaurado.`);
        toast("Pedido eliminado.", "ok");
    }

    function printTicket(pedido) {
        const area = $("#printArea");
        if (!area) return;

        area.replaceChildren();

        const contenedor = document.createElement("div");
        contenedor.className = "print-ticket";

        const titulo = document.createElement("h1");
        titulo.textContent = CONFIG.negocio;

        const subtitulo = document.createElement("p");
        subtitulo.className = "print-sub";
        subtitulo.textContent = `Pedido ${pedido.numero} · ${pedido.fechaTexto}`;

        contenedor.append(titulo, subtitulo);

        const linea = (etiqueta, valor, clase = "") => {
            const p = document.createElement("p");
            p.className = `print-linea ${clase}`.trim();

            const nombre = document.createElement("span");
            nombre.textContent = etiqueta;

            const contenido = document.createElement("strong");
            contenido.textContent = valor;

            p.append(nombre, contenido);
            return p;
        };

        contenedor.append(
            linea("Cliente", pedido.cliente),
            linea("Teléfono", formatPhone(pedido.telefono)),
            linea("Entrega", entregaTexto(pedido)),
            linea("Pago", pagoTexto(pedido)),
            document.createElement("hr")
        );

        pedido.items.forEach((item) => {
            contenedor.appendChild(
                linea(`${item.nombre} x${item.cantidad}`, money(item.precio * item.cantidad))
            );
        });

        contenedor.appendChild(document.createElement("hr"));
        contenedor.appendChild(linea("Subtotal", money(pedido.subtotal)));

        if (pedido.descuento) {
            contenedor.appendChild(
                linea(
                    `Descuento ${pedido.descuento.codigo} (-${pedido.descuento.pct}%)`,
                    `-${money(pedido.descuento.monto)}`
                )
            );
        }

        contenedor.appendChild(linea("TOTAL", money(pedido.total), "print-total"));

        const pie = document.createElement("p");
        pie.className = "print-pie";
        pie.textContent = "Gracias por tu compra. Conserva este comprobante.";
        contenedor.appendChild(pie);

        area.appendChild(contenedor);
        window.print();
    }


    /* ======================================================
       9. EXPORTACION E IMPORTACION
    ====================================================== */

    const csvCell = (valor) =>
        `"${String(valor ?? "").replace(/"/g, '""')}"`;

    function exportCSV() {
        if (!state.pedidos.length) {
            toast("Todavía no hay pedidos para exportar.", "warn");
            return;
        }

        const encabezados = [
            "Pedido", "Fecha", "Cliente", "Teléfono", "Email",
            "Entrega", "Ciudad", "Dirección", "Pago", "Referencia",
            "Productos", "Subtotal", "Descuento", "Total", "Estado"
        ];

        const filas = state.pedidos.map((pedido) => [
            pedido.numero,
            pedido.fechaTexto,
            pedido.cliente,
            formatPhone(pedido.telefono),
            pedido.email,
            pedido.entrega === "envio" ? "Envío" : "Retiro",
            pedido.ciudad,
            pedido.direccion,
            pedido.pago === "transferencia" ? "Transferencia/QR" : "Efectivo",
            pedido.referencia,
            pedido.items.map((item) => `${item.nombre} x${item.cantidad}`).join(" | "),
            pedido.subtotal,
            pedido.descuento
                ? `-${pedido.descuento.monto} (${pedido.descuento.codigo})`
                : "0",
            pedido.total,
            pedido.estado
        ]);

        const csv = "\uFEFF" + [encabezados, ...filas]
            .map((fila) => fila.map(csvCell).join(";"))
            .join("\r\n");

        download(`motolegend-pedidos-${localDateKey()}.csv`, csv, "text/csv;charset=utf-8");
        addLog("sistema", `Exportados ${state.pedidos.length} pedidos a CSV.`);
        toast("CSV descargado.", "ok");
    }

    function exportJSON() {
        const respaldo = {
            exportedAt: new Date().toISOString(),
            version: 2,
            negocio: CONFIG.negocio,
            state,
            log
        };

        download(
            `motolegend-respaldo-${localDateKey()}.json`,
            JSON.stringify(respaldo, null, 2),
            "application/json"
        );

        addLog("sistema", "Respaldo JSON exportado.");
        toast("Respaldo descargado.", "ok");
    }

    async function importBackup(file) {
        try {
            const texto = await file.text();
            const data = JSON.parse(texto);
            const rawState = data.state || data;

            if (
                !rawState ||
                !Array.isArray(rawState.pedidos) ||
                !Array.isArray(rawState.carrito) ||
                !Array.isArray(rawState.favoritos)
            ) {
                throw new Error("Formato no válido");
            }

            const confirmado = await askConfirm(
                "Importar respaldo",
                `Se reemplazarán los datos actuales por ${rawState.pedidos.length} ${plural(rawState.pedidos.length, "pedido", "pedidos")}.`,
                "Importar",
                false
            );

            if (!confirmado) return;

            state = sanitizeState(rawState);
            resetFilterUI();

            if (Array.isArray(data.log)) {
                log = data.log
                    .filter((item) => item && item.ts && item.msg)
                    .slice(0, 200);
            }

            saveState();
            saveLog();
            renderAll();
            renderLog();
            addLog("sistema", "Respaldo importado correctamente.");
            toast("Respaldo importado.", "ok");
        } catch (error) {
            toast("El archivo no es un respaldo válido de MotoLegend.", "error", 4000);
            addLog("sistema", "Intento de importación fallido.");
        }
    }

    function exportLog() {
        if (!log.length) {
            toast("No hay actividad para exportar.", "warn");
            return;
        }

        const texto = log
            .map((item) => {
                const fecha = new Date(item.ts).toLocaleString(CONFIG.locale);
                return `[${fecha}] ${String(item.tipo).toUpperCase()}: ${item.msg}`;
            })
            .join("\r\n");

        download(
            `motolegend-actividad-${localDateKey()}.txt`,
            texto,
            "text/plain;charset=utf-8"
        );

        toast("Actividad exportada.", "ok");
    }

    async function resetStock() {
        const confirmado = await askConfirm(
            "Restablecer stock",
            "El stock volverá a los valores iniciales. Los pedidos no se borrarán.",
            "Restablecer",
            false
        );

        if (!confirmado) return;

        state.stock = Object.fromEntries(PRODUCTOS.map((p) => [p.id, p.stock]));
        saveState();
        renderAll();
        addLog("sistema", "Stock restablecido a los valores iniciales.");
        toast("Stock restablecido.", "ok");
    }

    async function clearAll() {
        const confirmado = await askConfirm(
            "Borrar todos los datos",
            "Se eliminarán carrito, favoritos, pedidos y stock. Esta acción no se puede deshacer.",
            "Borrar todo"
        );

        if (!confirmado) return;

        state = defaultState();
        log = [];
        lastOrder = null;

        resetFilterUI();

        const filtroPedidos = $("#orderFilter");
        if (filtroPedidos) filtroPedidos.value = "todos";

        saveState();
        saveLog();
        renderAll();
        renderLog();
        addLog("sistema", "Datos borrados. Sistema reiniciado.");
        toast("Datos borrados.", "ok");
    }

    async function clearLog() {
        if (!log.length) {
            toast("No hay actividad para limpiar.", "warn");
            return;
        }

        const confirmado = await askConfirm(
            "Limpiar actividad",
            "Se borrará el historial de actividad de este navegador.",
            "Limpiar"
        );

        if (!confirmado) return;

        log = [];
        saveLog();
        renderLog();
        addLog("sistema", "Actividad limpiada.");
        toast("Actividad limpiada.", "ok");
    }


    /* ======================================================
       10. AYUDA / FAQ
    ====================================================== */

    const FAQ = {
        precio: {
            label: "Precios",
            answer: () =>
                `Nuestros modelos van desde ${money(8900)} hasta ${money(17900)}. Los precios del catálogo son en bolivianos y pueden variar según disponibilidad.`
        },
        ubicacion: {
            label: "Ubicación",
            answer: () =>
                `Estamos en ${CONFIG.ciudad}, Bolivia. Coordinamos el punto de entrega o retiro por WhatsApp.`
        },
        horario: {
            label: "Horario",
            answer: () =>
                "Atendemos de lunes a sábado, de 09:00 a 19:00. Los pedidos por WhatsApp se responden dentro del horario."
        },
        garantia: {
            label: "Garantía",
            answer: () =>
                "Todas nuestras motocicletas incluyen garantía y revisión técnica. Los detalles se confirman al cerrar el pedido."
        },
        pago: {
            label: "Formas de pago",
            answer: () =>
                "Aceptamos efectivo contra entrega y transferencia/QR. Si eliges transferencia, pide los datos por WhatsApp."
        },
        envio: {
            label: "Envíos",
            answer: () =>
                `Hacemos entregas en ${CONFIG.ciudad} y coordinamos envíos al resto del país. El costo se confirma por WhatsApp.`
        }
    };

    function showFaq(key) {
        const item = FAQ[key];
        if (!item) return;

        const caja = $("#faqRespuesta");
        if (!caja) return;

        caja.replaceChildren();

        const respuesta = document.createElement("p");
        respuesta.textContent = item.answer();

        const enlace = document.createElement("a");
        enlace.className = "btn-wa";
        enlace.href = waLink(
            `Hola ${CONFIG.negocio}, tengo una consulta sobre ${item.label.toLowerCase()}.`
        );
        enlace.target = "_blank";
        enlace.rel = "noopener";
        enlace.textContent = "💬 Preguntar por WhatsApp";

        caja.append(respuesta, enlace);
        caja.hidden = false;

        addLog("sistema", `Consulta FAQ: ${item.label}.`);
    }


    /* ======================================================
       11. DIALOGOS Y TOASTS
    ====================================================== */

    function showDialog(dialogo) {
        if (dialogo && !dialogo.open) dialogo.showModal();
    }

    function openCart() {
        renderCart();
        showDialog($("#cartDialog"));
    }

    function openOrders() {
        renderOrders();
        showDialog($("#ordersDialog"));
    }

    function askConfirm(titulo, mensaje, textoConfirmar = "Confirmar", peligro = true) {
        return new Promise((resolve) => {
            $("#confirmTitle").textContent = titulo;
            $("#confirmMessage").textContent = mensaje;

            const aceptar = $("#confirmAccept");
            aceptar.textContent = textoConfirmar;
            aceptar.classList.toggle("btn-danger", peligro);
            aceptar.classList.toggle("btn-primario", !peligro);

            confirmResolve = resolve;
            showDialog($("#confirmDialog"));
        });
    }

    function toast(mensaje, tipo = "info", duracion = 3000) {
        const contenedor = $("#toasts");
        if (!contenedor) return;

        if (contenedor.showPopover && !contenedor.matches(":popover-open")) {
            try {
                contenedor.showPopover();
            } catch (error) {
                /* sin soporte de popover: se muestra igual */
            }
        }

        const elemento = document.createElement("div");
        elemento.className = `toast toast-${tipo}`;
        elemento.textContent = mensaje;

        contenedor.appendChild(elemento);

        requestAnimationFrame(() => elemento.classList.add("show"));

        setTimeout(() => {
            elemento.classList.remove("show");

            setTimeout(() => {
                elemento.remove();

                if (!contenedor.children.length && contenedor.hidePopover) {
                    try {
                        contenedor.hidePopover();
                    } catch (error) {
                        /* ignorado */
                    }
                }
            }, 220);
        }, duracion);
    }

    async function copyText(texto) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(texto);
            } else {
                const area = document.createElement("textarea");
                area.value = texto;
                area.style.position = "fixed";
                area.style.opacity = "0";
                document.body.appendChild(area);
                area.select();
                document.execCommand("copy");
                area.remove();
            }

            toast("Copiado al portapapeles.", "ok");
        } catch (error) {
            toast("No se pudo copiar. Selecciona el texto manualmente.", "error");
        }
    }


    /* ======================================================
       12. EVENTOS
    ====================================================== */

    async function handleDelegatedClick(event) {
        if (!(event.target instanceof Element)) return;

        const trigger = event.target.closest("[data-action]");
        if (!trigger) return;

        const accion = trigger.dataset.action;
        const id = trigger.dataset.id;
        const numero = trigger.dataset.num;

        switch (accion) {
            case "close":
                trigger.closest("dialog")?.close();
                break;

            case "cat":
                state.filtros.categoria = trigger.dataset.cat;
                renderCategorias();
                renderProducts();
                break;

            case "reset-filters":
                resetFilterUI();
                renderCategorias();
                renderProducts();
                break;

            case "add":
                addToCart(id, 1);
                break;

            case "buy":
                if (addToCart(id, 1, true)) openCheckout();
                break;

            case "fav":
                toggleFav(id, trigger);
                break;

            case "qty-plus":
                changeQty(id, 1);
                break;

            case "qty-minus":
                changeQty(id, -1);
                break;

            case "remove":
                removeFromCart(id);
                break;

            case "clear-cart":
                await clearCart();
                break;

            case "checkout":
                openCheckout();
                break;

            case "del-order":
                await deleteOrder(numero);
                break;

            case "wa-order":
                shareOrder(numero);
                break;

            case "wa-ticket":
                if (lastOrder) {
                    window.open(waLink(orderMessage(lastOrder)), "_blank", "noopener");
                }
                break;

            case "copy-ticket":
                if (lastOrder) await copyText(ticketText(lastOrder));
                break;

            case "print-ticket":
                if (lastOrder) printTicket(lastOrder);
                break;

            case "export-csv":
                exportCSV();
                break;

            case "export-json":
                exportJSON();
                break;

            case "import-json":
                $("#importFile").click();
                break;

            case "reset-stock":
                await resetStock();
                break;

            case "clear-all":
                await clearAll();
                break;

            case "faq":
                showFaq(trigger.dataset.q);
                break;

            default:
                break;
        }
    }

    function wireEvents() {
        // Buscador con debounce
        $("#buscador").addEventListener(
            "input",
            debounce((event) => {
                state.filtros.q = event.target.value;
                renderProducts();
            }, 180)
        );

        $("#orden").addEventListener("change", (event) => {
            state.filtros.orden = event.target.value;
            renderProducts();
        });

        $("#orderFilter").addEventListener("change", renderOrders);
        $("#logFiltro").addEventListener("change", renderLog);

        $("#checkoutForm").addEventListener("submit", handleCheckoutSubmit);

        $("#openCart").addEventListener("click", openCart);
        $("#openOrders").addEventListener("click", openOrders);

        $("#heroQuickOrder").addEventListener("click", () => {
            if (!state.carrito.length) {
                toast("Agrega una moto al carrito para continuar.", "warn");
                $("#catalogo").scrollIntoView({ behavior: "smooth" });
                return;
            }
            openCheckout();
        });

        $("#exportLog").addEventListener("click", exportLog);
        $("#clearLog").addEventListener("click", clearLog);

        $("#importFile").addEventListener("change", async (event) => {
            const archivo = event.target.files && event.target.files[0];
            event.target.value = "";
            if (archivo) await importBackup(archivo);
        });

        // Confirmación genérica
        $("#confirmAccept").addEventListener("click", () => {
            const resolver = confirmResolve;
            confirmResolve = null;
            $("#confirmDialog").close();
            if (resolver) resolver(true);
        });

        $("#confirmCancel").addEventListener("click", () => {
            const resolver = confirmResolve;
            confirmResolve = null;
            $("#confirmDialog").close();
            if (resolver) resolver(false);
        });

        $("#confirmDialog").addEventListener("close", () => {
            if (confirmResolve) {
                const resolver = confirmResolve;
                confirmResolve = null;
                resolver(false);
            }
        });

        // Validación en vivo
        [
            ["cliente", "cliente"],
            ["email", "email"],
            ["direccion", "direccion"],
            ["referencia", "referencia"]
        ].forEach(([id, key]) => {
            const campo = $("#" + id);

            campo.addEventListener("blur", () => validateField(key));

            campo.addEventListener("input", () => {
                hideErrors();
                if (campo.getAttribute("aria-invalid") === "true") {
                    validateField(key);
                }
            });
        });

        // Teléfonos: solo dígitos, sin letras ni símbolos
        setupNumericPhone($("#telefono"), $("#err-telefono"));
        setupNumericPhone($("#livePhone"), $("#err-livePhone"));

        $("#ciudad").addEventListener("change", () => {
            hideErrors();
            if ($("#ciudad").getAttribute("aria-invalid") === "true") {
                validateField("ciudad");
            }
        });

        $("#pago").addEventListener("change", () => {
            togglePago();
            hideErrors();
            if ($("#pago").getAttribute("aria-invalid") === "true") {
                validateField("pago");
            }
        });

        $("#fecha").addEventListener("change", () => {
            hideErrors();
            validateField("fecha");
        });

        $("#terminos").addEventListener("change", () => {
            hideErrors();

            if ($("#terminos").checked) {
                setError($("#terminos"), $("#err-terminos"), "");
            } else if ($("#terminos").getAttribute("aria-invalid") === "true") {
                validateField("terminos");
            }
        });

        $$('input[name="entrega"]').forEach((radio) => {
            radio.addEventListener("change", () => {
                toggleEntrega();
                hideErrors();
                validateField("entrega");
            });
        });

        const codigo = $("#codigo");

        codigo.addEventListener("input", () => {
            hideErrors();
            updateCheckoutSummary();

            if (codigo.getAttribute("aria-invalid") === "true") {
                validateField("codigo");
            }
        });

        codigo.addEventListener("blur", () => {
            validateField("codigo");
            updateCheckoutSummary();
        });

        // LIVE: delegación de eventos dentro de #liveContainer
        const liveContainer = $("#liveContainer");

        liveContainer.addEventListener("click", (event) => {
            if (!(event.target instanceof Element)) return;

            const trigger = event.target.closest("[data-live-action]");
            if (!trigger) return;

            if (trigger.dataset.liveAction === "live-add") {
                const producto = productById(trigger.dataset.id);
                if (!producto) return;

                if (addToCart(producto.id, 1)) {
                    addLog("live", `OFERTA_CLICK: ${producto.nombre} agregado desde el live.`);
                }
            } else if (trigger.dataset.liveAction === "live-like") {
                sendLike();
            }
        });

        liveContainer.addEventListener("dblclick", (event) => {
            if (!(event.target instanceof Element)) return;
            if (!event.target.closest("[data-live-like]")) return;
            if (event.target.closest("[data-live-action]")) return;
            sendLike();
        });

        // Chat del live: keyup para registrar lo que escribe el espectador
        const chatInput = $("#chatInput");
        let ultimoChatLog = "";

        chatInput.addEventListener("keyup", () => {
            const texto = chatInput.value.trim();

            if (!texto || texto === ultimoChatLog) return;

            ultimoChatLog = texto;
            addLog("live", `CHAT_INPUT: "${texto.slice(0, 120)}"`);
        });

        chatInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendLiveChat();
            }
        });

        $("#liveChatSend").addEventListener("click", sendLiveChat);

        // Compra rápida en vivo: change + submit
        $("#liveProductSelect").addEventListener("change", updateLiveTotal);

        $("#variantSelect").addEventListener("change", (event) => {
            const variante = VARIANTES[event.target.value] || VARIANTES.estandar;
            updateLiveTotal();
            addLog("live", `CAMBIO_VARIANTE: ${variante.label}.`);
        });

        $("#orderForm").addEventListener("submit", handleLiveOrderSubmit);

        const userInput = $("#userTikTok");
        const errUser = $("#err-userTikTok");

        userInput.addEventListener("blur", () => {
            setError(userInput, errUser, userTikTokError(userInput.value));
        });

        userInput.addEventListener("input", () => {
            if (userInput.getAttribute("aria-invalid") === "true") {
                setError(userInput, errUser, userTikTokError(userInput.value));
            }
        });

        document.addEventListener("click", handleDelegatedClick);

        document.addEventListener("change", (event) => {
            if (!(event.target instanceof Element)) return;

            const select = event.target.closest('select[data-action="status"]');
            if (select) {
                setOrderStatus(select.dataset.num, select.value);
            }
        });
    }


    /* ======================================================
       13. INICIO
    ====================================================== */

    function init() {
        const anio = $("#anio");
        if (anio) anio.textContent = new Date().getFullYear();

        const waGeneral = $("#waGeneral");
        if (waGeneral) {
            waGeneral.href = waLink(
                `Hola ${CONFIG.negocio}, tengo una consulta sobre las motos.`
            );
        }

        setDateLimits();
        renderAll();
        renderLog();
        wireEvents();

        addLog("sistema", "Sistema iniciado. Catálogo y almacenamiento local listos.");

        saveState();

        if (!storageAvailable) {
            toast(
                "El almacenamiento local está bloqueado. Los datos no se guardarán al recargar.",
                "warn",
                5000
            );
        }

        console.log("MotoLegend v2 funcionando correctamente.");
    }

    init();

})();
