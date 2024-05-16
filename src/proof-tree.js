export function buildTreeDataCommon(steps) {
    const lastStep = steps[steps.length - 1];
    const rootNode = {
        name: (Array.isArray(lastStep.result) && lastStep.result.length === 0) || lastStep.result === '[]' ? "□" : lastStep.result,
        children: []
    };

    lastStep.resolved.forEach(resolved => {
        rootNode.children.push({
            name: `{${resolved.join(', ')}}`,
            children: []
        });
    });

    rootNode.children.forEach(childNode => {
        addChildrenToNode(childNode, steps.length - 2);
    });

    function addChildrenToNode(node, stepIndex) {
        if (stepIndex < 0) return;

        const currentStep = steps.find(step => (Array.isArray(step.result) ? step.result.join(', ') : step.result) === node.name.replace(/[{}]/g, ''));

        if (currentStep) {

            currentStep.resolved.forEach(resolved => {
                const childNode = {
                    name: `{${resolved.join(', ')}}`,
                    children: []
                };
                node.children.push(childNode);
                addChildrenToNode(childNode, stepIndex - 1);
            });
        }
    }

    return rootNode;
}
export function buildTreeDataLinear(steps) {
    const lastStep = steps[steps.length - 1];
    const rootNode = {
        name: (Array.isArray(lastStep.result) && lastStep.result.length === 0) || lastStep.result === '[]' ? "□" : `{${lastStep.result.join(', ')}}`,
        children: []
    };

    lastStep.resolved.forEach(resolved => {
        rootNode.children.push({
            name: `{${resolved.join(', ')}}`,
            children: []
        });
    });

    function addChildrenToNode(node, stepIndex) {
        if (stepIndex < 0) return;

        const currentStep = steps[stepIndex];
        if (currentStep && `{${currentStep.result.join(', ')}}` === node.name) {
            currentStep.resolved.forEach(resolved => {
                const childNode = {
                    name: `{${resolved.join(', ')}}`,
                    children: []
                };
                node.children.push(childNode);
                addChildrenToNode(childNode, stepIndex - 1);
            });
        }
    }

    rootNode.children.forEach(childNode => {
        addChildrenToNode(childNode, steps.length - 2);
    });

    return rootNode;
}

export function downloadSVG(svgElement, fileName) {
    const styles = `
            .link {
                fill: none;
                stroke: #000;
                stroke-width: 1px;
            }

            .node circle {
                fill: #fff;
                stroke: #000;
                stroke-width: 1px;
            }

            .node text {
                font: 12px sans-serif;
            }

            .node--internal circle {
                fill: #ffffff;
            }

            .node--leaf circle {
                fill: #fff;
            }
            `;

    const cloneSvgElement = svgElement.cloneNode(true);

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    cloneSvgElement.prepend(styleElement);

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(cloneSvgElement);

    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

export function drawTree(data, treeContainer) {
    const width = 400;
    const height = 400;
    const margin = { top: 0, right: 0, bottom: 50, left: 0 };

    const treeDiv = treeContainer === '#tree-container'
        ? document.querySelector('.Tree')
        : document.querySelector('.Dynamic-Tree');
    const treeWidth = treeDiv.getBoundingClientRect().width;

    d3.select(treeContainer).select('svg').remove();

    function updateTreeSize() {
        const treeDiv = document.querySelector(treeContainer);
        const treeWidth = Math.max(treeDiv.getBoundingClientRect().width - 20, 0);

        const svgElement = d3.select(treeContainer).select('svg');
        svgElement
            .attr('width', treeWidth)
            .attr('height', height + margin.top + margin.bottom)
            .attr('viewBox', `0 0 ${width} ${height + margin.top + margin.bottom}`)
            .attr('preserveAspectRatio', 'xMidYMid meet');

        const offsetX = Math.max((treeWidth - width) / 2, 0);
        const offsetY = margin.top;

        svgElement.select('g').attr('transform', `translate(${offsetX},${offsetY})`);
    }

    const svg = d3.select(treeContainer).append('svg')
        .attr('width', Math.max(treeWidth - 20, 0))
        .attr('height', height + margin.top + margin.bottom)
        .attr('viewBox', `0 0 ${width} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .call(d3.zoom().on("zoom", function (event) {
            d3.select(this).select('g').attr("transform", event.transform);
        }))
        .append('g')
        .attr('transform', `translate(${Math.max((treeWidth - width) / 2, 0)},${margin.top})`);

    updateTreeSize();

    const treemap = d3.tree()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
        .separation((a, b) => a.parent === b.parent ? 1 : 2);

    let root = d3.hierarchy(data, d => d.children);
    treemap(root);

    root.descendants().forEach(d => {
        d.y = height - d.y;
    });

    const drag = d3.drag()
        .on('start', dragStarted)
        .on('drag', dragging)
        .on('end', dragEnded);

    function dragStarted(event, d) {
        d3.select(this).raise().attr('stroke', 'black');
    }

    function dragging(event, d) {
        d.x = event.x;
        d.y = event.y;
        d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
        updateLinks();
    }

    function dragEnded(event, d) {
        d3.select(this).attr('stroke', null);
    }

    function updateLinks() {
        link.attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))
    }

    const link = svg.selectAll('.link')
        .data(root.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))

    const node = svg.selectAll('.node')
        .data(root.descendants())
        .enter().append('g')
        .attr('class', d => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .call(drag);

    node.append('circle')
        .attr('r', 10);

    node.append('text')
        .attr('dy', '0.35em')
        .attr('x', d => d.children ? -13 : 13)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .style('font-size', '15px')
        .text(d => d.data.name);
}

export function clearTree(treeContainer) {
    const svgContainer = d3.select(treeContainer);
    svgContainer.selectAll('*').remove();
}

function generateTikzCode(node, indentLevel = 1, isRoot = false) {
    let childIndent = "\t".repeat(indentLevel + 1);

    let nodeName = node.name
        .replace("□", "$\\square$")
        .replace(/\{([^}]+)}/g, (match, p1) => `{$\\{${p1.replace(/¬/g, "\\neg ")}\\}$}`);


    if (!node.children || node.children.length === 0) {
        return `${isRoot ? '\\node' : 'node'} {${nodeName}}`;
    }

    let childrenStr = node.children.map((child, index) => {
        let suffix = (isRoot && index === node.children.length - 1) ? ';' : '';
        return `${childIndent}child {${generateTikzCode(child, indentLevel + 2)} edge from parent}${suffix}\n`;
    }).join('');

    return `${isRoot ? '\\node' : 'node'} {${nodeName}} [grow=up]\n${childrenStr}`;
}

export function buildTikzPicture(treeData) {
    let tikzStr = "\\begin{tikzpicture}\n";

    tikzStr += generateTikzCode(treeData,1,true);

    tikzStr += "\\end{tikzpicture}";

    return tikzStr;
}

function convertNodeNameToString(node) {
    if (Array.isArray(node.name)) {
        return node.name.join(", ");
    } else if (typeof node.name === 'string') {
        return node.name;
    } else {
        return "";
    }
}

export function replaceGreekSymbolsWithLatex(stringNode) {
    const greekSymbols = {
        "α": "\\alpha",
        "β": "\\beta",
        "γ": "\\gamma",
        "δ": "\\delta",
        "ε": "\\epsilon",
        "ζ": "\\zeta",
        "η": "\\eta",
        "θ": "\\theta",
        "ι": "\\iota",
        "κ": "\\kappa",
        "λ": "\\lambda",
        "μ": "\\mu",
        "ξ": "\\xi",
        "ο": "\\omicron",
        "π": "\\pi",
        "ρ": "\\rho",
        "σ": "\\sigma",
        "τ": "\\tau",
        "υ": "\\upsilon",
        "φ": "\\phi",
        "χ": "\\chi",
        "ψ": "\\psi",
        "ω": "\\omega",
        "⊥": "{\\bot}"
    };

    const regex = new RegExp(`(${Object.keys(greekSymbols).join("|")})`, "g");
    return stringNode.replace(regex, (match) => greekSymbols[match]);
}

let ifRoot = true;

export function setIfRoot(value) {
    ifRoot = value;
}

function generateTikzCodeDynamic(node, indentLevel = 1, isRoot = false) {
    let childIndent = "\t".repeat(indentLevel + 1);

    let stringNode = convertNodeNameToString(node);

    if(stringNode !== "□" && ifRoot) {
        ifRoot = false;
        stringNode = "{" + stringNode + "}";
    }

    if(stringNode === "□") {
        ifRoot = false;
    }

    stringNode = replaceGreekSymbolsWithLatex(stringNode);


    stringNode = stringNode
        .replace("□", "$\\square$")
        .replace(/\{([^}]+)}/g, (match, p1) => `{$\\{${p1.replace(/¬/g, "\\neg ")}\\}$}`);


    if (!node.children || node.children.length === 0) {
        return `${isRoot ? '\\node' : 'node'} {${stringNode}}`;
    }

    let childrenStr = node.children.map((child, index) => {
        let suffix = (isRoot && index === node.children.length - 1) ? ';' : '';
        return `${childIndent}child {${generateTikzCodeDynamic(child, indentLevel + 2)} edge from parent}${suffix}\n`;
    }).join('');

    return `${isRoot ? '\\node' : 'node'} {${stringNode}} [grow=up]\n${childrenStr}`;
}

export function buildTikzPictureDynamic(treeData) {
    let tikzStr = "\\begin{tikzpicture}\n";

    tikzStr += generateTikzCodeDynamic(treeData,1,true);

    tikzStr += "\\end{tikzpicture}";

    return tikzStr;
}
