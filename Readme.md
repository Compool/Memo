간단한 메모장을 직접 만드시는군요\! 가장 빠르게 결과물을 볼 수 있도록 **HTML/CSS(프론트엔드)**, **JavaScript(로직)**, 그리고 별도의 서버 설치 없이 브라우저 내부에 데이터를 저장하는 **LocalStorage** 방식을 먼저 추천해 드립니다.

나중에 실제 서버 DB(MySQL, MongoDB 등)로 확장하기 전, 프로토타입을 만드는 가장 효율적인 방법입니다.

-----

## 1\. 화면 디자인 (UI Layout)

구조는 직관적입니다. 중앙에 메모 공간을 배치하고, 하단에 제어 버튼을 모아둡니다.

  * **입력창:** `textarea` 태그를 사용하여 2\~3줄 정도의 높이를 확보합니다.
  * **버튼 그룹:** 저장, 불러오기, 삭제 버튼을 나란히 배치합니다.

-----

## 2\. 프로그램 코드 (HTML/JS)

이 코드를 하나의 `.html` 파일로 저장해서 실행해 보세요.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>심플 메모장</title>
    <style>
        body { font-family: sans-serif; display: flex; justify-content: center; padding-top: 50px; background: #f0f2f5; }
        .memo-container { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        textarea { width: 300px; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; resize: none; display: block; }
        .btn-group { margin-top: 10px; display: flex; gap: 5px; }
        button { flex: 1; padding: 10px; border: none; border-radius: 5px; cursor: pointer; color: white; transition: 0.2s; }
        .btn-save { background-color: #4CAF50; }
        .btn-load { background-color: #2196F3; }
        .btn-delete { background-color: #f44336; }
        button:hover { opacity: 0.8; }
    </style>
</head>
<body>

<div class="memo-container">
    <textarea id="memoInput" placeholder="여기에 메모를 작성하세요..."></textarea>
    <div class="btn-group">
        <button class="btn-save" onclick="saveMemo()">저장</button>
        <button class="btn-load" onclick="loadMemo()">불러오기</button>
        <button class="btn-delete" onclick="deleteMemo()">삭제</button>
    </div>
</div>

<script>
    const memoField = document.getElementById('memoInput');

    // 저장 로직
    function saveMemo() {
        const content = memoField.value;
        if (!content) return alert("내용을 입력해주세요.");
        localStorage.setItem('myMemo', content);
        alert("성공적으로 저장되었습니다!");
    }

    // 불러오기 로직
    function loadMemo() {
        const savedData = localStorage.getItem('myMemo');
        if (savedData) {
            memoField.value = savedData;
        } else {
            alert("저장된 메모가 없습니다.");
        }
    }

    // 삭제 로직
    function deleteMemo() {
        if (confirm("메모를 삭제할까요?")) {
            localStorage.removeItem('myMemo');
            memoField.value = "";
        }
    }
</script>

</body>
</html>
```

-----

## 3\. 데이터베이스(DB) 생성 및 연결 안내

위 코드는 브라우저의 **LocalStorage**를 사용하지만, 진짜 서버 DB를 사용하고 싶다면 다음과 같은 스택을 권장합니다.

| 구분 | 추천 기술 | 특징 |
| :--- | :--- | :--- |
| **Frontend** | HTML/JS | 현재 작성된 코드 그대로 사용 가능 |
| **Backend** | Node.js (Express) | JavaScript로 서버를 구축할 수 있어 학습 곡선이 낮음 |
| **Database** | **SQLite** 또는 **Firebase** | **SQLite:** 설정 없이 파일 하나로 운영되는 가벼운 DB<br>**Firebase:** 구글에서 제공하는 클라우드 DB (서버 구축 필요 없음) |

### 실제 서버 DB로 확장하는 단계:

1.  **API 서버 구축:** Node.js 등으로 `POST /save`, `GET /load` 같은 주소를 만듭니다.
2.  **DB 스키마 생성:** \* `id` (고유번호, 기본키)
      * `content` (메모 내용, TEXT 타입)
      * `updated_at` (저장 시간)
3.  **연결:** 위 JavaScript의 `localStorage` 코드 부분을 `fetch()` 함수를 이용한 서버 통신 코드로 교체합니다.

-----

> **팁:** 만약 서버 구축이 번거로우시다면 **Firebase Realtime Database**를 검색해보세요. 별도의 서버 코딩 없이 위 HTML 파일만으로도 실제 클라우드 DB에 데이터를 영구 저장할 수 있습니다.

혹시 Node.js나 Python(Flask) 같은 특정 언어로 서버와 DB를 직접 구축하는 코드가 필요하신가요? 구체적인 환경을 말씀해 주시면 바로 작성해 드릴 수 있습니다\!