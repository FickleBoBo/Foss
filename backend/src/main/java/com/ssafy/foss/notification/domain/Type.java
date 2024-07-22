package com.ssafy.foss.notification.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Type {
    APPLY("TYPE_APPLY"),
    CONFIRM("TYPE_CONFIRM");

    private String value;
}