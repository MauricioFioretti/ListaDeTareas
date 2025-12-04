//Selecciono el header .item-container
const header = document.querySelector("header")

//Creo la section titulo
const titulo = document.createElement("section")
titulo.classList = "titulo"
header.appendChild(titulo)

//Agrego el h1 a la section titulo
const h1 = document.createElement("h1")
h1.innerText = "Lista de Tareas"
titulo.appendChild(h1)

//Selecciono el main
const main = document.querySelector("main")

//Agrego la section para agregar items a la lista
const seccionLista = document.createElement("section")
seccionLista.classList = "agregarItem"
main.appendChild(seccionLista)

//Agrego un label, un input y un button a la section para agregar items
const label1 = document.createElement("label")
label1.innerText = "Agregar tarea: "
seccionLista.appendChild(label1)

const input1 = document.createElement("input")
input1.type = "text"
seccionLista.appendChild(input1)

const button1 = document.createElement("button")
button1.innerText = "Agregar"
seccionLista.appendChild(button1)

//Agrego la section items al main, donde aparecen todos los items de la lista
const seccionItems = document.createElement("section")
seccionItems.classList = "items"
main.appendChild(seccionItems)


//====================== SECCIÓN DE UTILIDADES (copiar / importar) ======================
const seccionUtilidades = document.createElement("section")
seccionUtilidades.classList = "utilidades"
main.appendChild(seccionUtilidades)

// --- Bloque: copiar lista ---
const copiarContainer = document.createElement("div")
copiarContainer.classList = "copiar-lista"
seccionUtilidades.appendChild(copiarContainer)

const labelCopiar = document.createElement("label")
labelCopiar.innerText = "Copiar tareas de esta lista"
copiarContainer.appendChild(labelCopiar)

const buttonCopiar = document.createElement("button")
buttonCopiar.innerText = "Copiar tareas"
copiarContainer.appendChild(buttonCopiar)

// --- Bloque: pegar / importar lista ---
const importarContainer = document.createElement("div")
importarContainer.classList = "importar-lista"
seccionUtilidades.appendChild(importarContainer)

const labelImportar = document.createElement("label")
labelImportar.innerText = "Pegar una lista de tareas que te pasaron:"
importarContainer.appendChild(labelImportar)

const textareaImportar = document.createElement("textarea")
textareaImportar.rows = 4
textareaImportar.placeholder = "Una tarea por línea o separadas por comas..."
importarContainer.appendChild(textareaImportar)

const buttonImportar = document.createElement("button")
buttonImportar.innerText = "Agregar a mis tareas"
importarContainer.appendChild(buttonImportar)

// ===================== CLAVE DE STORAGE (ESPECÍFICA DE TAREAS) =====================
const STORAGE_KEY = "listaTareas"

//=============================Funcion para agregar elementos al Storage y al DOM===========================

// Función para agregar un nuevo elemento al almacenamiento local
function agregarElementoAlLocalStorage(texto, completado = false) {
    const newItem = {
        texto: texto.trim(),
        completado: completado
    }

    if (newItem.texto === "") return

    let listaItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

    // Evitar duplicados (sin importar mayúsculas/minúsculas)
    let valor = listaItems.some(obj => obj.texto.toLowerCase() == newItem.texto.toLowerCase())

    if (!valor) {
        listaItems.push(newItem)
        // Orden alfabético
        listaItems.sort((a, b) =>
            (a.texto.toLowerCase() > b.texto.toLowerCase()) ? 1 :
            (a.texto.toLowerCase() < b.texto.toLowerCase()) ? -1 : 0
        )
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listaItems))
    }
}

// Función para cargar la lista de elementos desde el almacenamiento local
function cargarListaDesdeLocalStorage() {
    let listaItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

    // ✅ Ordenar: primero los completados (true) al inicio
    listaItems.sort((a, b) => {
        if (a.completado === b.completado) {
            return a.texto.toLowerCase().localeCompare(b.texto.toLowerCase())
        }
        return b.completado - a.completado
    })

    // ✅ IMPORTANTE: guardar el orden ya ordenado
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listaItems))

    // limpio primero
    seccionItems.innerHTML = ""

    listaItems.forEach(function (item, index) {
        const itemContainer = document.createElement("div")
        itemContainer.classList.add("item-container")

        const tick = document.createElement("input")
        tick.type = "checkbox"
        tick.checked = item.completado

        tick.addEventListener("change", function () {
            // actualizo ese item en el array
            item.completado = tick.checked
            localStorage.setItem(STORAGE_KEY, JSON.stringify(listaItems))
            cargarListaDesdeLocalStorage() // 🔄 refrescar y reordenar
        })

        const listItem = document.createElement("p")
        listItem.innerText = item.texto

        const botonEliminarItem = document.createElement("button")
        botonEliminarItem.innerText = "Eliminar"
        botonEliminarItem.classList.add("eliminar-item")
        botonEliminarItem.setAttribute("data-index", index)

        itemContainer.appendChild(tick)
        itemContainer.appendChild(listItem)
        itemContainer.appendChild(botonEliminarItem)

        seccionItems.appendChild(itemContainer)
    })
}

// Evento de click para eliminar un elemento individual
seccionItems.addEventListener("click", function (event) {
    if (event.target.classList.contains("eliminar-item")) {
        const index = parseInt(event.target.getAttribute("data-index"))
        eliminarElemento(index)
    }
})

// Evento de click para agregar elementos
button1.addEventListener("click", function () {
    //capturo el texto ingresado en el input
    const textoItem = input1.value

    //Verificación del input con algún texto
    if (textoItem !== "") {
        agregarElementoAlLocalStorage(textoItem)

        // Limpio el input y enfoco nuevamente en el input para seguir escribiendo
        input1.value = ""
        input1.focus()

        // Recargo la lista desde el almacenamiento local
        cargarListaDesdeLocalStorage()
    }
})

//Función eliminar un solo item
function eliminarElemento(index) {
    let listaItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

    // como el storage ya está ORDENADO igual que el DOM,
    // ahora este index sí coincide ✅
    listaItems.splice(index, 1)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(listaItems))

    cargarListaDesdeLocalStorage()
}

// ===================== COPIAR LISTA =====================
buttonCopiar.addEventListener("click", function () {
    const listaItems = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []

    if (listaItems.length === 0) {
        alert("No hay tareas para copiar.")
        return
    }

    // ✅ solo los textos, sin símbolos ni ticks
    const texto = listaItems
        .map(item => item.texto)
        .join("\n")

    navigator.clipboard.writeText(texto)
        .then(() => alert("Lista copiada al portapapeles ✅"))
        .catch(() => alert("No se pudo copiar 😢"))
})

// ===================== IMPORTAR / PEGAR LISTA =====================
buttonImportar.addEventListener("click", function () {
    const textoPegado = textareaImportar.value

    if (textoPegado.trim() === "") {
        alert("Pegá primero una lista 😉")
        return
    }

    // Aceptamos listas separadas por saltos de línea o por comas
    let candidatos = []
    if (textoPegado.includes("\n")) {
        candidatos = textoPegado.split("\n")
    } else {
        candidatos = textoPegado.split(",")
    }

    candidatos = candidatos
        .map(t => t.trim())
        .filter(t => t !== "")

    // Los vamos agregando uno por uno al localStorage (ya evita duplicados)
    candidatos.forEach(itemTexto => {
        agregarElementoAlLocalStorage(itemTexto)
    })

    // limpio textarea
    textareaImportar.value = ""

    // recargo vista
    cargarListaDesdeLocalStorage()
})

// Cargo la lista al cargar la página
window.addEventListener("load", cargarListaDesdeLocalStorage)

cargarListaDesdeLocalStorage()
