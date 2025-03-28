/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Root } from 'react-dom/client';

export type Async<T> = Promise<T> | T;

export type Getter<T, P = any> = (props?: P) => Async<T>;
export type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';
export type ElementInsertOptions = {
  element: Element;
  insertPosition?: InsertPosition;
};
export type ElementInsertOptionsList = ElementInsertOptions[];
export type GetElement = Getter<Element>;
export type GetElementInsertOptions = Getter<ElementInsertOptions>;

export type CSUIAnchor = {
  element: Element;
  type: 'inline';
  insertPosition?: InsertPosition;
  root?: Root;
  props?: Record<string, unknown>;
};

export type CSUIMountState = {
  document: Document;
  observer: MutationObserver | null;
  mountInterval: NodeJS.Timer | null;
  isMounting: boolean;
  isMutated: boolean;
  /**
   * Used to quickly check if element is already mounted
   */
  hostSet: Set<Element>;
  /**
   * Used to add more metadata to the host Set
   */
  hostMap: WeakMap<Element, CSUIAnchor>;
  /**
   * Used to align overlay anchor with elements on the page
   */
  overlayTargetList: Element[];
};

type CSUIProps = {
  anchor?: CSUIAnchor;
};

type GetRootContainer = (
  props: {
    mountState?: CSUIMountState;
  } & CSUIProps,
) => Async<Element>;
type GetInlineAnchor = GetElement | GetElementInsertOptions;
type GetInlineAnchorList = Getter<NodeList | ElementInsertOptionsList>;
type MountShadowHost = (
  props: {
    mountState?: CSUIMountState;
    shadowHost: Element;
  } & CSUIProps,
) => Async<void>;
type GetShadowHostId = Getter<string, CSUIAnchor>;
type GetStyle = Getter<
  HTMLStyleElement,
  CSUIAnchor & {
    sfcStyleContent?: string;
  }
>;
type GetSfcStyleContent = Getter<string>;

type CreateShadowRoot = (shadowHost: HTMLElement) => Async<ShadowRoot>;

type CSUIRender<T> = (
  props: {
    createRootContainer?: (p: CSUIAnchor) => Async<Element>;
  } & CSUIProps,
  InlineCSUIContainer?: T,
) => Async<void>;

type CSUIWatch = (props: {
  render: (anchor: CSUIAnchor) => Async<void>;
  observer: {
    start: (render: (anchor?: CSUIAnchor) => void) => void;
    mountState: CSUIMountState;
  };
}) => void;

export type CSUIContainerProps = {
  id?: string;
  children?: React.ReactNode;
} & CSUIProps;

export type CSUIJSXContainer = (p?: CSUIContainerProps) => JSX.Element;

export type CSUI<T> = {
  default: any;
  getStyle: GetStyle;
  getSfcStyleContent: GetSfcStyleContent;
  getShadowHostId: GetShadowHostId;
  getInlineAnchor: GetInlineAnchor;
  getInlineAnchorList: GetInlineAnchorList;
  getRootContainer: GetRootContainer;
  createShadowRoot: CreateShadowRoot;
  mountShadowHost: MountShadowHost;
  render: CSUIRender<T>;
  watch: CSUIWatch;
};
