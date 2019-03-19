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

import { IModelItem, EUnitType, TUnitType } from "common/types/document";

import NVItem from "./NVItem";

import CVMeta from "../components/CVMeta";
import CVArticles from "../components/CVArticles";
import CVAnnotations from "../components/CVAnnotations_old";
import CVModel from "../components/CVModel";

////////////////////////////////////////////////////////////////////////////////

export default class NVModel extends NVItem
{
    static readonly typeName: string = "NVModel";

    get meta() {
        return this.components.get(CVMeta);
    }
    get articles() {
        return this.components.get(CVArticles);
    }
    get annotations() {
        return this.components.get(CVAnnotations);
    }
    get model() {
        return this.components.get(CVModel);
    }

    createComponents()
    {
        super.createComponents();

        this.createComponent(CVMeta);
        this.createComponent(CVArticles);
        this.createComponent(CVAnnotations);
        this.createComponent(CVModel);
    }

    fromData(data: IModelItem)
    {
        // base class serializes units
        super.fromData(data);

        if (data.meta) {
            this.meta.fromData(data.meta);
        }

        if (data.articles) {
            this.articles.fromData(data.articles);
        }

        if (data.annotations) {
            this.annotations.fromData(data.annotations);
        }

        if (data.model) {
            this.model.fromData(data.model);
        }
    }

    toData(): IModelItem
    {
        // base class serializes units
        const data: IModelItem = super.toData();

        const metaData = this.meta.toData();
        if (metaData) {
            data.meta = metaData;
        }

        const articleData = this.articles.toData();
        if (articleData) {
            data.articles = articleData;
        }

        const annotationData = this.annotations.toData();
        if (annotationData) {
            data.annotations = annotationData;
        }

        const modelData = this.model.toData();
        if (modelData) {
            data.model = modelData;
        }

        return data;
    }
}