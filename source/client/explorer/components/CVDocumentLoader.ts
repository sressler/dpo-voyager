/**
 * 3D Foundation Project
 * Copyright 2018 Smithsonian Institution
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import resolvePathname from "resolve-pathname";

import Component from "@ff/graph/Component";

import { IDocument } from "common/types/document";
import { IPresentation } from "common/types/presentation";
import { IItem } from "common/types/item";

import * as presentationTemplate from "common/templates/presentation.json";

import { EDerivativeQuality } from "../../core/models/Derivative";

import CVAssetLoader from "../../core/components/CVAssetLoader";
import CVDocumentManager from "./CVDocumentManager";
import CVDocument from "./CVDocument";
import CVDocument_old from "./CVDocument_old";

import NVDocuments from "../nodes/NVDocuments";
import NVItem_old from "../nodes/NVItem_old";

////////////////////////////////////////////////////////////////////////////////

export default class CVDocumentLoader extends Component
{
    static readonly typeName: string = "CVDocumentLoader";

    protected get assetLoader() {
        return this.getMainComponent(CVAssetLoader);
    }

    loadDocument(documentOrUrl: string | object): Promise<CVDocument | null>
    {
        const url = typeof documentOrUrl === "string" ? documentOrUrl : "";
        const getDocument = url ? this.assetLoader.loadDocumentData(url) : Promise.resolve(documentOrUrl as IDocument);

        return getDocument.then(documentData => {
            console.log(documentData);
            return null;
        });
    }

    loadPresentation(presentationOrUrl: string | IPresentation): Promise<CVDocument_old | null>
    {
        const documents = this.system.getMainNode(NVDocuments);

        const url = typeof presentationOrUrl === "string" ? presentationOrUrl : "";
        const getPresentation = url ? this.assetLoader.loadPresentationData(url) : Promise.resolve(presentationOrUrl as IPresentation);

        return getPresentation.then(presentationData => {
            const document = documents.createComponent(CVDocument_old);
            document.url = url;
            document.fromDocument(presentationData);
            return document;
        }).catch(error => {
            console.warn("Failed to open presentation", error);
            return null;
        });
    }

    loadDefaultPresentation(): Promise<CVDocument_old>
    {
        return this.loadPresentation(presentationTemplate as IPresentation);
    }

    loadItem(itemOrUrl: string | IItem): Promise<NVItem_old | null>
    {
        const documentManager = this.system.getMainComponent(CVDocumentManager);

        const url = typeof itemOrUrl === "string" ? itemOrUrl : "item.json";
        const getItem = url ? this.assetLoader.loadItemData(url) : Promise.resolve(itemOrUrl as IItem);

        let itemData;

        return getItem.then(data => {
            itemData = data;
            return documentManager.activeDocument as CVDocument_old ||
                this.loadPresentation(presentationTemplate as IPresentation);
        }).then(document => {
            const item = document.createItem();
            item.url = url;
            item.fromData(itemData);
            return item;
        }).catch(error => {
            console.warn("Failed to open item", error);
            return null;
        });
    }

    createItemWithModelAsset(modelUrl: string, itemUrl?: string, quality?: string): Promise<NVItem_old | null>
    {
        let document = this.system.getMainComponent(CVDocumentManager).activeDocument as CVDocument_old;

        let derivativeQuality = EDerivativeQuality[quality];
        if (!isFinite(derivativeQuality)) {
            derivativeQuality = EDerivativeQuality.Medium;
        }

        if (!itemUrl) {
            const urlPath = resolvePathname(".", modelUrl);
            itemUrl = urlPath + "item.json";

            const nameIndex = modelUrl.startsWith(urlPath) ? urlPath.length : 0;
            modelUrl = modelUrl.substr(nameIndex);
        }

        const getDocument = document ? Promise.resolve(document) :
            this.loadDefaultPresentation();

        return getDocument.then(document => {
            const item = document.createItem();
            item.url = itemUrl;
            item.createModelAsset(derivativeQuality, modelUrl);
            return item;
        }).catch(error => {
            console.warn("Failed to open model", error);
            return null;
        });
    }

    createItemFromGeometryAndMaps(geoUrl: string, colorMapUrl?: string,
                                  occlusionMapUrl?: string, normalMapUrl?: string, itemUrl?: string, quality?: string): Promise<NVItem_old | null>
    {
        let document = this.system.getMainComponent(CVDocumentManager).activeDocument as CVDocument_old;

        let derivativeQuality = EDerivativeQuality[quality];
        if (!isFinite(derivativeQuality)) {
            derivativeQuality = EDerivativeQuality.Medium;
        }

        if (!itemUrl) {
            const urlPath = resolvePathname(".", geoUrl);
            itemUrl = urlPath + "item.json";

            const nameIndex = geoUrl.startsWith(urlPath) ? urlPath.length : 0;
            geoUrl = geoUrl.substr(nameIndex);

            if (colorMapUrl) {
                const nameIndex = colorMapUrl.startsWith(urlPath) ? urlPath.length : 0;
                colorMapUrl = colorMapUrl.substr(nameIndex);
            }
            if (occlusionMapUrl) {
                const nameIndex = occlusionMapUrl.startsWith(urlPath) ? urlPath.length : 0;
                occlusionMapUrl = occlusionMapUrl.substr(nameIndex);
            }
            if (normalMapUrl) {
                const nameIndex = normalMapUrl.startsWith(urlPath) ? urlPath.length : 0;
                normalMapUrl = normalMapUrl.substr(nameIndex);
            }
        }

        const getDocument = document ? Promise.resolve(document) :
            this.loadDefaultPresentation();

        return getDocument.then(document => {
            const item = document.createItem();
            item.url = itemUrl || "item.json";
            item.createMeshAsset(derivativeQuality, geoUrl, colorMapUrl, occlusionMapUrl, normalMapUrl);
            return item;
        }).catch(error => {
            console.warn("Failed to open model", error);
            return null;
        });
    }
}