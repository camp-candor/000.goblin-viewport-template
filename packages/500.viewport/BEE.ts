import Model from './99.core/interface/model.interface'

import ViewportUnit from './00.viewport.unit/viewport.unit'
import AcousticclockUnit from './01.acousticclock.unit/acousticclock.unit'
import AmbienceUnit from './02.ambience.unit/ambience.unit'
import AssetsUnit from './03.assets.unit/assets.unit'
import BoundaryUnit from './04.boundary.unit/boundary.unit'
import CameraUnit from './05.camera.unit/camera.unit'
import CoordinatesUnit from './06.coordinates.unit/coordinates.unit'
import DialogueUnit from './07.dialogue.unit/dialogue.unit'
import EdgecontrolUnit from './08.edgecontrol.unit/edgecontrol.unit'
import ExposuresheetUnit from './09.exposuresheet.unit/exposuresheet.unit'
import FoleyUnit from './10.foley.unit/foley.unit'
import GeneratorUnit from './11.generator.unit/generator.unit'
import GreenscreenUnit from './12.greenscreen.unit/greenscreen.unit'
import LifecycleUnit from './13.lifecycle.unit/lifecycle.unit'
import ManifestUnit from './14.manifest.unit/manifest.unit'
import MathsUnit from './15.maths.unit/maths.unit'
import PuppetUnit from './16.puppet.unit/puppet.unit'
import RemotionUnit from './17.remotion.unit/remotion.unit'
import RigsUnit from './18.rigs.unit/rigs.unit'
import SealsUnit from './19.seals.unit/seals.unit'
import SourcebakingUnit from './20.sourcebaking.unit/sourcebaking.unit'
import StyleUnit from './21.style.unit/style.unit'
import TemporalquantizationUnit from './22.temporalquantization.unit/temporalquantization.unit'
import VersionsUnit from './23.versions.unit/versions.unit'
import ModelUnit from './96.model.unit/model.unit'
import CollectUnit from './97.collect.unit/collect.unit'
import MenuUnit from './98.menu.unit/menu.unit'
import BusUnit from './99.bus.unit/bus.unit'

import Viewport from './00.viewport.unit/fce/viewport.interface'
import { ViewportModel } from './00.viewport.unit/viewport.model'
import Acousticclock from './01.acousticclock.unit/fce/acousticclock.interface'
import { AcousticclockModel } from './01.acousticclock.unit/acousticclock.model'
import Ambience from './02.ambience.unit/fce/ambience.interface'
import { AmbienceModel } from './02.ambience.unit/ambience.model'
import Assets from './03.assets.unit/fce/assets.interface'
import { AssetsModel } from './03.assets.unit/assets.model'
import Boundary from './04.boundary.unit/fce/boundary.interface'
import { BoundaryModel } from './04.boundary.unit/boundary.model'
import Camera from './05.camera.unit/fce/camera.interface'
import { CameraModel } from './05.camera.unit/camera.model'
import Coordinates from './06.coordinates.unit/fce/coordinates.interface'
import { CoordinatesModel } from './06.coordinates.unit/coordinates.model'
import Dialogue from './07.dialogue.unit/fce/dialogue.interface'
import { DialogueModel } from './07.dialogue.unit/dialogue.model'
import Edgecontrol from './08.edgecontrol.unit/fce/edgecontrol.interface'
import { EdgecontrolModel } from './08.edgecontrol.unit/edgecontrol.model'
import Exposuresheet from './09.exposuresheet.unit/fce/exposuresheet.interface'
import { ExposuresheetModel } from './09.exposuresheet.unit/exposuresheet.model'
import Foley from './10.foley.unit/fce/foley.interface'
import { FoleyModel } from './10.foley.unit/foley.model'
import Generator from './11.generator.unit/fce/generator.interface'
import { GeneratorModel } from './11.generator.unit/generator.model'
import Greenscreen from './12.greenscreen.unit/fce/greenscreen.interface'
import { GreenscreenModel } from './12.greenscreen.unit/greenscreen.model'
import Lifecycle from './13.lifecycle.unit/fce/lifecycle.interface'
import { LifecycleModel } from './13.lifecycle.unit/lifecycle.model'
import Manifest from './14.manifest.unit/fce/manifest.interface'
import { ManifestModel } from './14.manifest.unit/manifest.model'
import Maths from './15.maths.unit/fce/maths.interface'
import { MathsModel } from './15.maths.unit/maths.model'
import Puppet from './16.puppet.unit/fce/puppet.interface'
import { PuppetModel } from './16.puppet.unit/puppet.model'
import Remotion from './17.remotion.unit/fce/remotion.interface'
import { RemotionModel } from './17.remotion.unit/remotion.model'
import Rigs from './18.rigs.unit/fce/rigs.interface'
import { RigsModel } from './18.rigs.unit/rigs.model'
import Seals from './19.seals.unit/fce/seals.interface'
import { SealsModel } from './19.seals.unit/seals.model'
import Sourcebaking from './20.sourcebaking.unit/fce/sourcebaking.interface'
import { SourceBakingModel } from './20.sourcebaking.unit/sourcebaking.model'
import Style from './21.style.unit/fce/style.interface'
import { StyleModel } from './21.style.unit/style.model'
import Temporalquantization from './22.temporalquantization.unit/fce/temporalquantization.interface'
import { TemporalquantizationModel } from './22.temporalquantization.unit/temporalquantization.model'
import Versions from './23.versions.unit/fce/versions.interface'
import { VersionsModel } from './23.versions.unit/versions.model'
import ModelInterface from './96.model.unit/fce/model.interface'
import { ModelModel } from './96.model.unit/model.model'
import Collect from './97.collect.unit/fce/collect.interface'
import { CollectModel } from './97.collect.unit/collect.model'
import Menu from './98.menu.unit/fce/menu.interface'
import { MenuModel } from './98.menu.unit/menu.model'
import Bus from './99.bus.unit/fce/bus.interface'
import { BusModel } from './99.bus.unit/bus.model'

export const list: Array<any> = [
    ViewportUnit,
    AcousticclockUnit,
    AmbienceUnit,
    AssetsUnit,
    BoundaryUnit,
    CameraUnit,
    CoordinatesUnit,
    DialogueUnit,
    EdgecontrolUnit,
    ExposuresheetUnit,
    FoleyUnit,
    GeneratorUnit,
    GreenscreenUnit,
    LifecycleUnit,
    ManifestUnit,
    MathsUnit,
    PuppetUnit,
    RemotionUnit,
    RigsUnit,
    SealsUnit,
    SourcebakingUnit,
    StyleUnit,
    TemporalquantizationUnit,
    VersionsUnit,
    ModelUnit,
    CollectUnit,
    MenuUnit,
    BusUnit,
]

import * as reduceFromViewport from './00.viewport.unit/viewport.reduce'
import * as reduceFromAcousticclock from './01.acousticclock.unit/acousticclock.reduce'
import * as reduceFromAmbience from './02.ambience.unit/ambience.reduce'
import * as reduceFromAssets from './03.assets.unit/assets.reduce'
import * as reduceFromBoundary from './04.boundary.unit/boundary.reduce'
import * as reduceFromCamera from './05.camera.unit/camera.reduce'
import * as reduceFromCoordinates from './06.coordinates.unit/coordinates.reduce'
import * as reduceFromDialogue from './07.dialogue.unit/dialogue.reduce'
import * as reduceFromEdgecontrol from './08.edgecontrol.unit/edgecontrol.reduce'
import * as reduceFromExposuresheet from './09.exposuresheet.unit/exposuresheet.reduce'
import * as reduceFromFoley from './10.foley.unit/foley.reduce'
import * as reduceFromGenerator from './11.generator.unit/generator.reduce'
import * as reduceFromGreenscreen from './12.greenscreen.unit/greenscreen.reduce'
import * as reduceFromLifecycle from './13.lifecycle.unit/lifecycle.reduce'
import * as reduceFromManifest from './14.manifest.unit/manifest.reduce'
import * as reduceFromMaths from './15.maths.unit/maths.reduce'
import * as reduceFromPuppet from './16.puppet.unit/puppet.reduce'
import * as reduceFromRemotion from './17.remotion.unit/remotion.reduce'
import * as reduceFromRigs from './18.rigs.unit/rigs.reduce'
import * as reduceFromSeals from './19.seals.unit/seals.reduce'
import * as reduceFromSourcebaking from './20.sourcebaking.unit/sourcebaking.reduce'
import * as reduceFromStyle from './21.style.unit/style.reduce'
import * as reduceFromTemporalquantization from './22.temporalquantization.unit/temporalquantization.reduce'
import * as reduceFromVersions from './23.versions.unit/versions.reduce'
import * as reduceFromModel from './96.model.unit/model.reduce'
import * as reduceFromCollect from './97.collect.unit/collect.reduce'
import * as reduceFromMenu from './98.menu.unit/menu.reduce'
import * as reduceFromBus from './99.bus.unit/bus.reduce'

export const reducer: any = {
    viewport: reduceFromViewport.reducer,
    acousticclock: reduceFromAcousticclock.reducer,
    ambience: reduceFromAmbience.reducer,
    assets: reduceFromAssets.reducer,
    boundary: reduceFromBoundary.reducer,
    camera: reduceFromCamera.reducer,
    coordinates: reduceFromCoordinates.reducer,
    dialogue: reduceFromDialogue.reducer,
    edgecontrol: reduceFromEdgecontrol.reducer,
    exposuresheet: reduceFromExposuresheet.reducer,
    foley: reduceFromFoley.reducer,
    generator: reduceFromGenerator.reducer,
    greenscreen: reduceFromGreenscreen.reducer,
    lifecycle: reduceFromLifecycle.reducer,
    manifest: reduceFromManifest.reducer,
    maths: reduceFromMaths.reducer,
    puppet: reduceFromPuppet.reducer,
    remotion: reduceFromRemotion.reducer,
    rigs: reduceFromRigs.reducer,
    seals: reduceFromSeals.reducer,
    sourcebaking: reduceFromSourcebaking.reducer,
    style: reduceFromStyle.reducer,
    temporalquantization: reduceFromTemporalquantization.reducer,
    versions: reduceFromVersions.reducer,
    model: reduceFromModel.reducer,
    collect: reduceFromCollect.reducer,
    menu: reduceFromMenu.reducer,
    bus: reduceFromBus.reducer,
}

export default class UnitData implements Model {
    viewport: Viewport = new ViewportModel()
    acousticclock: Acousticclock = new AcousticclockModel()
    ambience: Ambience = new AmbienceModel()
    assets: Assets = new AssetsModel()
    boundary: Boundary = new BoundaryModel()
    camera: Camera = new CameraModel()
    coordinates: Coordinates = new CoordinatesModel()
    dialogue: Dialogue = new DialogueModel()
    edgecontrol: Edgecontrol = new EdgecontrolModel()
    exposuresheet: Exposuresheet = new ExposuresheetModel()
    foley: Foley = new FoleyModel()
    generator: Generator = new GeneratorModel()
    greenscreen: Greenscreen = new GreenscreenModel()
    lifecycle: Lifecycle = new LifecycleModel()
    manifest: Manifest = new ManifestModel()
    maths: Maths = new MathsModel()
    puppet: Puppet = new PuppetModel()
    remotion: Remotion = new RemotionModel()
    rigs: Rigs = new RigsModel()
    seals: Seals = new SealsModel()
    sourcebaking: Sourcebaking = new SourceBakingModel()
    style: Style = new StyleModel()
    temporalquantization: Temporalquantization = new TemporalquantizationModel()
    versions: Versions = new VersionsModel()
    model: ModelInterface = new ModelModel()
    collect: Collect = new CollectModel()
    menu: Menu = new MenuModel()
    bus: Bus = new BusModel()
}
