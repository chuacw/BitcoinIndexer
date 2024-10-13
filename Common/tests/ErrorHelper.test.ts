import { isErrnoException } from '../ErrorHelper';
import { isArbitraryObject } from 'delphirtl/sysutils';

class ErrNoException extends Error {

  constructor(name: string, value: any) {
    super();
    Object.defineProperty(this, name, {
      value: value,
      enumerable: true,
      writable: true
    })
  }
}

describe('isArbitraryObject', () => {

  it("should identify isArbitraryObject correctly", () => {
    const obj = {};
    const objResult = isArbitraryObject(obj);
    expect(objResult).toBe(true);
  });

  it("shouldn't identify isArbitraryObject-1 incorrectly", () => {
    const obj = null;
    const objResult = isArbitraryObject(obj);
    expect(objResult).toBe(false);
  });

  it("shouldn't identify isArbitraryObject-2 incorrectly", () => {
    const obj = undefined;
    const objResult = isArbitraryObject(obj);
    expect(objResult).toBe(false);
  });

  it("shouldn't identify isArbitraryObject-3 incorrectly", () => {
    const objResult = isArbitraryObject(5);
    expect(objResult).toBe(false);
  });

  it("shouldn't identify isArbitraryObject-4 incorrectly", () => {
    const objResult = isArbitraryObject([]);
    expect(objResult).toBe(false);
  });

});

describe('isErrnoException', () => {

  it('should identify errnoException.errno correctly', () => {
    const errnoException = new ErrNoException("errno", 1);
    const errnoExceptionResult = isErrnoException(errnoException);
    expect(errnoExceptionResult).toBe(true);
  });

  it("shouldn't identify errnoException.errno incorrectly", () => {
    const errnoException = new ErrNoException("errno", "some value");
    const errnoExceptionResult = isErrnoException(errnoException);
    expect(errnoExceptionResult).toBe(false);
  });

  it('should identify errnoException.code correctly', () => {
    const errnoException = new ErrNoException("code", "some code");
    const errnoExceptionResult = isErrnoException(errnoException);
    expect(errnoExceptionResult).toBe(true);
  });

  it("shouldn't identify errnoException.code incorrectly", () => {
    const errnoException = new ErrNoException("code", 5);
    const errnoExceptionResult = isErrnoException(errnoException);
    expect(errnoExceptionResult).toBe(false);
  });

  it('should identify errnoException.path correctly', () => {
    const errnoException = new ErrNoException("path", "some path");
    const errnoExceptionResult = isErrnoException(errnoException);
    expect(errnoExceptionResult).toBe(true);
  });

  it("shouldn't identify errnoException.path incorrectly", () => {
    const errnoException = new ErrNoException("path", 10);
    const errnoExceptionResult = isErrnoException(errnoException);
    expect(errnoExceptionResult).toBe(false);
  });

  it('should identify errnoException.syscall correctly', () => {
    const errnoException = new ErrNoException("syscall", "syscall value");
    const errnoExceptionResult = isErrnoException(errnoException);
    expect(errnoExceptionResult).toBe(true);
  });

  it("shouldn't identify errnoException.syscall incorrectly", () => {
    const errnoException = new ErrNoException("syscall", 8);
    const errnoExceptionResult = isErrnoException(errnoException);
    expect(errnoExceptionResult).toBe(false);
  });

});
